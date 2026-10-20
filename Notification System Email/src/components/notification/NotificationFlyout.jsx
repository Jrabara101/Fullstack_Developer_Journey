import React, { useRef, useEffect, useMemo } from 'react';
import { CheckCheck, Settings, Inbox, Sparkles, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { ActionableNotificationCard } from './ActionableNotificationCard';

export const NotificationFlyout = ({ isOpen, onClose, onNavigateToInbox, onNavigateToSettings }) => {
  const flyoutRef = useRef(null);
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    activeFilter,
    setActiveFilter,
    selectedId,
    setSelectedId,
  } = useNotifications();

  // Close flyout on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        const bellBtn = document.getElementById('notification-bell-button');
        if (bellBtn && bellBtn.contains(e.target)) return;
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter items based on active pill
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => !n.isArchived)
      .filter((n) => {
        if (activeFilter === 'unread') return !n.isRead;
        if (activeFilter === 'mentions') return n.category === 'collaboration' && n.targetEntity?.type === 'comment';
        if (activeFilter === 'system') return n.category === 'security' || n.category === 'billing';
        return true; // 'all'
      });
  }, [notifications, activeFilter]);

  // Group notifications by date: "Today", "Yesterday", "Older"
  const groupedNotifications = useMemo(() => {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 3600 * 1000;

    filteredNotifications.forEach((n) => {
      const time = new Date(n.createdAt).getTime();
      if (time >= startOfToday) {
        today.push(n);
      } else if (time >= startOfYesterday) {
        yesterday.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, older };
  }, [filteredNotifications]);

  if (!isOpen) return null;

  return (
    <div
      ref={flyoutRef}
      className="absolute right-0 top-full mt-2 w-[420px] max-h-[580px] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-[#242730] bg-white dark:bg-[#191B20] text-slate-900 dark:text-[#F8FAFC] overflow-hidden z-50 animate-slide-down"
      style={{
        boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* 1. Header Strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#242730]/70 bg-white dark:bg-[#191B20]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 tabular-nums">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Mark all as read button */}
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            title="Mark all as read"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              onClose();
              onNavigateToSettings();
            }}
            title="Notification preferences"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Close flyout */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Segmented Filter Pills */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-[#242730]/50 bg-slate-50/50 dark:bg-[#131418]/60 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'mentions', label: 'Mentions' },
          { id: 'system', label: 'System' },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setActiveFilter(pill.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-all ${
              activeFilter === pill.id
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-zinc-800/40'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. Grouped List Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#242730]/40 max-h-[420px]">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center text-slate-400 mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              No notifications in this view
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              You're completely caught up. Nice work!
            </p>
          </div>
        ) : (
          <>
            {/* Today Header & Items */}
            {groupedNotifications.today.length > 0 && (
              <div>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-[#131418]/80 sticky top-0 z-10 backdrop-blur-sm">
                  Today
                </div>
                {groupedNotifications.today.map((notif) => (
                  <ActionableNotificationCard
                    key={notif.id}
                    notification={notif}
                    isSelected={selectedId === notif.id}
                    onSelect={(id) => {
                      setSelectedId(id);
                      onNavigateToInbox();
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}

            {/* Yesterday Header & Items */}
            {groupedNotifications.yesterday.length > 0 && (
              <div>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-[#131418]/80 sticky top-0 z-10 backdrop-blur-sm">
                  Yesterday
                </div>
                {groupedNotifications.yesterday.map((notif) => (
                  <ActionableNotificationCard
                    key={notif.id}
                    notification={notif}
                    isSelected={selectedId === notif.id}
                    onSelect={(id) => {
                      setSelectedId(id);
                      onNavigateToInbox();
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}

            {/* Older Header & Items */}
            {groupedNotifications.older.length > 0 && (
              <div>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-[#131418]/80 sticky top-0 z-10 backdrop-blur-sm">
                  Older
                </div>
                {groupedNotifications.older.map((notif) => (
                  <ActionableNotificationCard
                    key={notif.id}
                    notification={notif}
                    isSelected={selectedId === notif.id}
                    onSelect={(id) => {
                      setSelectedId(id);
                      onNavigateToInbox();
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Footer Bar */}
      <div className="p-2 border-t border-slate-100 dark:border-[#242730] bg-slate-50/80 dark:bg-[#131418] text-center">
        <button
          onClick={() => {
            onClose();
            onNavigateToInbox();
          }}
          className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-zinc-800/80 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>View all notifications in Inbox</span>
          <span className="font-mono text-sm leading-none">→</span>
        </button>
      </div>
    </div>
  );
};
