import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { INITIAL_NOTIFICATIONS, INITIAL_PREFERENCES } from '../mock/initialData';
import { soundService } from '../services/soundService';
import { FatigueShieldEngine } from '../services/fatigueShield';
import { queueSimulator } from '../services/queueSimulator';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('stitch_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('stitch_preferences');
    return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
  });

  const [selectedId, setSelectedId] = useState(notifications[0]?.id || null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'mentions', 'system', 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  
  // Real-time WebSocket connection state
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'connected', 'connecting', 'polling_fallback', 'disconnected'
  const [wsLatencyMs, setWsLatencyMs] = useState(18);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Badge animation trigger
  const [badgeTriggerKey, setBadgeTriggerKey] = useState(0);

  // Undo Toast state
  const [undoState, setUndoState] = useState(null); // { message, previousState, timeoutId }
  const undoTimerRef = useRef(null);

  // "Why did I receive this?" audit modal item
  const [auditTarget, setAuditTarget] = useState(null);

  // Active email preview target
  const [emailPreviewTarget, setEmailPreviewTarget] = useState(null);

  // Fatigue shield engine instance
  const fatigueShieldRef = useRef(new FatigueShieldEngine(preferences));

  // Sync preferences with engine
  useEffect(() => {
    fatigueShieldRef.current.updatePreferences(preferences);
    localStorage.setItem('stitch_preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('stitch_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Dynamic ping simulation
  useEffect(() => {
    if (connectionStatus !== 'connected') return;
    const interval = setInterval(() => {
      setWsLatencyMs(Math.floor(14 + Math.random() * 12));
    }, 5000);
    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Calculated unread count (excluding archived and snoozed)
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead && !n.isArchived && !n.isSnoozed).length;
  }, [notifications]);

  // Check and trigger escalation fallback for urgent notifications
  useEffect(() => {
    const checkEscalation = () => {
      notifications.forEach(n => {
        if (!n.isRead && n.metadata?.escalationPending && n.metadata?.escalationDueAt) {
          const due = new Date(n.metadata.escalationDueAt).getTime();
          if (Date.now() >= due) {
            // Escalate to email
            queueSimulator.addJob({
              queue: 'escalation-fallback',
              name: 'dispatch-fallback-email-after-30m',
              status: 'completed',
              payload: {
                notificationId: n.id,
                channel: 'email_fallback',
                reason: 'Notification remained unread in-app past 30-min threshold.'
              }
            });
            // Update metadata to show escalation dispatched
            setNotifications(prev => prev.map(item => item.id === n.id ? {
              ...item,
              metadata: {
                ...item.metadata,
                escalationPending: false,
                escalatedToEmailAt: new Date().toISOString()
              }
            } : item));
          }
        }
      });
    };

    const interval = setInterval(checkEscalation, 10000);
    return () => clearInterval(interval);
  }, [notifications]);

  // Optimistic Mark Read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
  };

  // Optimistic Mark Unread
  const markAsUnread = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false, readAt: null } : n));
    if (soundEnabled) soundService.playNotificationChime();
  };

  // Optimistic Archive
  const archiveNotification = (id) => {
    const snapshot = [...notifications];
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isArchived: true } : n));
    triggerUndo('Archived notification', snapshot);
  };

  // Unarchive notification
  const unarchiveNotification = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isArchived: false } : n));
  };

  // Mark all as read with 5s undo
  const markAllAsRead = () => {
    const count = unreadCount;
    if (count === 0) return;
    const snapshot = [...notifications];
    setNotifications(prev => prev.map(n => (!n.isArchived ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
    triggerUndo(`Marked ${count} notification${count > 1 ? 's' : ''} as read`, snapshot);
  };

  // Batch mark read
  const batchMarkRead = (ids = selectedBatchIds) => {
    if (ids.length === 0) return;
    const snapshot = [...notifications];
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
    setSelectedBatchIds([]);
    triggerUndo(`Marked ${ids.length} item${ids.length > 1 ? 's' : ''} as read`, snapshot);
  };

  // Batch archive
  const batchArchive = (ids = selectedBatchIds) => {
    if (ids.length === 0) return;
    const snapshot = [...notifications];
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isArchived: true } : n));
    setSelectedBatchIds([]);
    triggerUndo(`Archived ${ids.length} item${ids.length > 1 ? 's' : ''}`, snapshot);
  };

  // Snooze notification
  const snoozeNotification = (id, durationMinutes = 180) => {
    const snoozedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isSnoozed: true, snoozedUntil } : n));
    triggerUndo(`Snoozed for ${durationMinutes >= 60 ? `${durationMinutes / 60} hours` : `${durationMinutes}m`}`, notifications);
  };

  // Optimistic action resolution (e.g. Accept, Decline, Approve PR, Reply)
  const resolveAction = (id, resolvedState) => {
    if (soundEnabled) soundService.playSuccessPop();
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          isRead: true,
          actionResolved: true,
          actionResolvedState: resolvedState,
        };
      }
      return n;
    }));

    // Record BullMQ audit job
    queueSimulator.addJob({
      queue: 'instant-dispatch',
      name: `action-${resolvedState}`,
      status: 'completed',
      payload: { notificationId: id, resolvedState }
    });
  };

  // Handle non-blocking 5-second undo toast
  const triggerUndo = (message, previousState) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    
    setUndoState({
      message,
      previousState,
      duration: 5000,
      createdAt: Date.now()
    });

    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (undoState?.previousState) {
      setNotifications(undoState.previousState);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoState(null);
    }
  };

  // Real-time Event Receiver (with Fatigue Shield processing)
  const dispatchIncomingNotification = (rawEvent) => {
    const shieldResult = fatigueShieldRef.current.processIncomingEvent(rawEvent);

    if (shieldResult.status === 'rate_suppressed') {
      return {
        success: false,
        shieldStatus: shieldResult.status,
        reason: shieldResult.reason
      };
    }

    if (shieldResult.status === 'queued_dnd') {
      return {
        success: true,
        shieldStatus: shieldResult.status,
        reason: shieldResult.reason,
        heldCount: shieldResult.heldCount
      };
    }

    const finalNotif = shieldResult.notification;
    if (finalNotif) {
      setNotifications(prev => [finalNotif, ...prev]);
      setSelectedId(finalNotif.id);
      setBadgeTriggerKey(k => k + 1);

      if (soundEnabled) {
        soundService.playNotificationChime();
      }

      // Add to BullMQ queue simulator
      queueSimulator.addJob({
        queue: shieldResult.status === 'aggregated_digest' ? 'batch-aggregator' : 'instant-dispatch',
        name: shieldResult.status === 'aggregated_digest' ? 'aggregate-events-digest' : 'broadcast-websocket-event',
        status: 'completed',
        dedupHash: fatigueShieldRef.current.generateDedupHash(finalNotif),
        payload: { title: finalNotif.title, category: finalNotif.category }
      });
    }

    return {
      success: true,
      shieldStatus: shieldResult.status,
      reason: shieldResult.reason,
      notification: finalNotif
    };
  };

  // Release DND morning stack
  const releaseDndMorningStack = () => {
    const held = fatigueShieldRef.current.releaseMorningStack();
    if (held.length > 0) {
      setNotifications(prev => [...held, ...prev]);
      setBadgeTriggerKey(k => k + 1);
      if (soundEnabled) soundService.playNotificationChime();
      queueSimulator.addJob({
        queue: 'digest-cron',
        name: 'release-circadian-morning-stack',
        status: 'completed',
        payload: { releasedCount: held.length }
      });
    }
    return held.length;
  };

  // Update preferences helper
  const updatePreferenceMatrix = (updater) => {
    setPreferences(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        preferences,
        unreadCount,
        selectedId,
        setSelectedId,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        selectedBatchIds,
        setSelectedBatchIds,
        connectionStatus,
        setConnectionStatus,
        wsLatencyMs,
        soundEnabled,
        setSoundEnabled,
        badgeTriggerKey,
        undoState,
        handleUndo,
        dismissUndo: () => setUndoState(null),
        markAsRead,
        markAsUnread,
        archiveNotification,
        unarchiveNotification,
        markAllAsRead,
        batchMarkRead,
        batchArchive,
        snoozeNotification,
        resolveAction,
        dispatchIncomingNotification,
        releaseDndMorningStack,
        auditTarget,
        setAuditTarget,
        emailPreviewTarget,
        setEmailPreviewTarget,
        updatePreferenceMatrix,
        fatigueEngine: fatigueShieldRef.current
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};
