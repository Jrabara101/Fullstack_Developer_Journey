import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Check, 
  Archive, 
  Trash2, 
  Clock, 
  BellOff, 
  Filter, 
  ExternalLink, 
  Info, 
  Mail, 
  MessageSquare, 
  GitPullRequest, 
  ShieldAlert, 
  CreditCard, 
  CheckCheck, 
  CornerDownRight, 
  Send, 
  ShieldCheck, 
  Sparkles,
  Command
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { ActionableNotificationCard } from '../notification/ActionableNotificationCard';

export const NotificationInboxView = () => {
  const {
    notifications,
    selectedId,
    setSelectedId,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedBatchIds,
    setSelectedBatchIds,
    markAsRead,
    markAsUnread,
    archiveNotification,
    batchMarkRead,
    batchArchive,
    snoozeNotification,
    resolveAction,
    setAuditTarget,
    setEmailPreviewTarget,
    markAllAsRead,
    unreadCount
  } = useNotifications();

  const [commentReplyText, setCommentReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Filter & Search
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (activeFilter === 'archived') return n.isArchived;
        if (n.isArchived) return false;
        if (activeFilter === 'unread') return !n.isRead;
        if (activeFilter === 'mentions') return n.category === 'collaboration' && n.targetEntity?.type === 'comment';
        if (activeFilter === 'system') return n.category === 'security' || n.category === 'billing';
        return true;
      })
      .filter((n) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          n.actor?.name?.toLowerCase().includes(q) ||
          n.targetEntity?.name?.toLowerCase().includes(q)
        );
      });
  }, [notifications, activeFilter, searchQuery]);

  // Selected Notification Item
  const activeNotification = useMemo(() => {
    return notifications.find((n) => n.id === selectedId) || filteredNotifications[0] || null;
  }, [notifications, selectedId, filteredNotifications]);

  // Keyboard navigation listener (J, K, E, U, S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const currentIndex = filteredNotifications.findIndex((n) => n.id === selectedId);

      // J or Down Arrow: next item
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < filteredNotifications.length - 1) {
          const next = filteredNotifications[currentIndex + 1];
          setSelectedId(next.id);
          markAsRead(next.id);
        }
      }

      // K or Up Arrow: previous item
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prev = filteredNotifications[currentIndex - 1];
          setSelectedId(prev.id);
          markAsRead(prev.id);
        }
      }

      // E: Archive current item
      if (e.key === 'e' || e.key === 'E') {
        if (activeNotification) {
          e.preventDefault();
          archiveNotification(activeNotification.id);
        }
      }

      // U: Toggle Unread
      if (e.key === 'u' || e.key === 'U') {
        if (activeNotification) {
          e.preventDefault();
          if (activeNotification.isRead) {
            markAsUnread(activeNotification.id);
          } else {
            markAsRead(activeNotification.id);
          }
        }
      }

      // S: Snooze for 3 hours
      if (e.key === 's' || e.key === 'S') {
        if (activeNotification) {
          e.preventDefault();
          snoozeNotification(activeNotification.id, 180);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredNotifications, selectedId, activeNotification]);

  // Toggle selection for batch toolbar
  const toggleSelectAll = () => {
    if (selectedBatchIds.length === filteredNotifications.length) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(filteredNotifications.map((n) => n.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendDetailReply = (e) => {
    e.preventDefault();
    if (!commentReplyText.trim() || !activeNotification) return;
    setIsSendingReply(true);
    setTimeout(() => {
      resolveAction(activeNotification.id, 'replied');
      setIsSendingReply(false);
      setCommentReplyText('');
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0A0B0E]">
      {/* Top Console Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-200 dark:border-[#242730] bg-white dark:bg-[#101217]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-sm" />
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Triage Inbox
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <Command className="w-3 h-3" />
            <span>Power Triage Mode</span>
          </div>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Stage Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Column: 420px Fixed Master List */}
        <div className="w-full md:w-[420px] shrink-0 flex flex-col border-r border-slate-200 dark:border-[#242730] bg-white dark:bg-[#131418]/50 overflow-hidden">
          {/* Search Bar with Fuzzy Query */}
          <div className="p-3 border-b border-slate-200 dark:border-[#242730] bg-white dark:bg-[#131418]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword, author, or project..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Tab Filter Horizon */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-[#242730]/60 bg-slate-50/50 dark:bg-[#0E0F13] overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'mentions', label: 'Mentions' },
              { id: 'system', label: 'System' },
              { id: 'archived', label: 'Archived' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-all ${
                  activeFilter === tab.id
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Multi-Select Batch Action Toolbar (Appears when items checked) */}
          {selectedBatchIds.length > 0 ? (
            <div className="flex items-center justify-between px-3 py-2 bg-blue-50/90 dark:bg-blue-950/70 border-b border-blue-200 dark:border-blue-900/60 animate-fade-in">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedBatchIds.length === filteredNotifications.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-200">
                  {selectedBatchIds.length} selected
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => batchMarkRead()}
                  className="px-2 py-1 rounded bg-white dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => batchArchive()}
                  className="px-2 py-1 rounded bg-white dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm"
                >
                  Archive
                </button>
                <button
                  onClick={() => {
                    selectedBatchIds.forEach((id) => snoozeNotification(id, 180));
                    setSelectedBatchIds([]);
                  }}
                  className="px-2 py-1 rounded bg-white dark:bg-zinc-800 text-[11px] font-medium text-purple-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm"
                >
                  Snooze 3h
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#242730]/40">
              <button
                onClick={toggleSelectAll}
                className="hover:text-slate-600 dark:hover:text-slate-300"
              >
                Select all ({filteredNotifications.length})
              </button>
              <span>{filteredNotifications.length} items</span>
            </div>
          )}

          {/* Master List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#242730]/40">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No matching notifications found
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Try adjusting your filter or search query
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <ActionableNotificationCard
                  key={notif.id}
                  notification={notif}
                  isSelected={activeNotification?.id === notif.id}
                  onSelect={(id) => {
                    setSelectedId(id);
                    markAsRead(id);
                  }}
                  selectable={true}
                  isChecked={selectedBatchIds.includes(notif.id)}
                  onCheckToggle={toggleSelectOne}
                />
              ))
            )}
          </div>

          {/* Keyboard Legend Status Bar */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-[#242730] bg-slate-50 dark:bg-[#101217] text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-mono mr-1">
                  J
                </kbd>
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-mono mr-1">
                  K
                </kbd>
                Navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-mono mr-1">
                  E
                </kbd>
                Archive
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-mono mr-1">
                  U
                </kbd>
                Unread
              </span>
            </div>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-mono mr-1">
                S
              </kbd>
              Snooze
            </span>
          </div>
        </div>

        {/* Right Stage: Fluid High-Context Detail Preview Stage */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-[#0E0F13] overflow-y-auto">
          {activeNotification ? (
            <div className="max-w-4xl w-full mx-auto p-6 flex flex-col gap-6">
              {/* Context Reading Card Header */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-[#242730] shadow-sm flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {activeNotification.actor?.avatar ? (
                      <img
                        src={activeNotification.actor.avatar}
                        alt={activeNotification.actor.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-zinc-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-center text-sm">
                        {activeNotification.category === 'security' ? (
                          <ShieldAlert className="w-6 h-6 text-red-500" />
                        ) : (
                          activeNotification.actor?.name?.slice(0, 2).toUpperCase() || 'SYS'
                        )}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                          {activeNotification.actor?.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                          {activeNotification.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeNotification.actor?.role} • {activeNotification.actor?.email}
                      </p>
                    </div>
                  </div>

                  {/* Right Header Controls */}
                  <div className="flex items-center gap-2">
                    {/* "Why did I receive this?" */}
                    <button
                      onClick={() => setAuditTarget(activeNotification)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-all"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <span>Why did I get this?</span>
                    </button>

                    {/* Transactional Email Preview */}
                    <button
                      onClick={() => setEmailPreviewTarget(activeNotification)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-all"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>View Email</span>
                    </button>
                  </div>
                </div>

                {/* Subject / Headline */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#242730]">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {activeNotification.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    Received on {new Date(activeNotification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Target Entity Deep Content Stage */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-[#242730] shadow-sm flex flex-col gap-5">
                {/* 1. Pull Request Entity Preview */}
                {activeNotification.targetEntity?.type === 'pull_request' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {activeNotification.targetEntity.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-emerald-500 font-semibold">
                          +{activeNotification.targetEntity.diffStats?.additions || 342}
                        </span>
                        <span className="text-red-500 font-semibold">
                          -{activeNotification.targetEntity.diffStats?.deletions || 89}
                        </span>
                        <span className="text-slate-400">
                          in {activeNotification.targetEntity.diffStats?.filesChanged || 14} files
                        </span>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {activeNotification.targetEntity.preview}
                    </p>

                    {/* Diff Snippet Simulation */}
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
                      <div className="text-slate-500 mb-1">// infra/redis/failover.tf</div>
                      <div className="text-emerald-400">+ resource "aws_elasticache_replication_group" "pulse_redis" &#123;</div>
                      <div className="text-emerald-400">+   automatic_failover_enabled = true</div>
                      <div className="text-emerald-400">+   multi_az_enabled           = true</div>
                      <div className="text-red-400">- resource "aws_elasticache_cluster" "legacy_single" &#123;</div>
                    </div>
                  </div>
                )}

                {/* 2. Security Login Entity Preview */}
                {activeNotification.targetEntity?.type === 'auth_session' && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                          Unfamiliar Security Session Detected
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          {activeNotification.targetEntity.preview}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                        <span className="text-[10px] font-mono uppercase text-slate-400">IP Address</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                          {activeNotification.targetEntity.ip || '194.26.29.11'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Location</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          {activeNotification.targetEntity.location || 'Frankfurt, Germany'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Device</span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
                          {activeNotification.targetEntity.device || 'Chrome 130 on Linux'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Thread Comments Conversation Context */}
                {activeNotification.targetEntity?.type === 'comment' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {activeNotification.targetEntity.name}
                      </span>
                    </div>

                    {/* Thread History Bubble */}
                    <div className="space-y-3">
                      {(activeNotification.targetEntity.threadContext || [
                        { author: activeNotification.actor?.name, time: 'recently', text: activeNotification.body }
                      ]).map((msg, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border-l-4 border-blue-600 bg-slate-50 dark:bg-[#191B20] text-slate-800 dark:text-slate-200"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white">{msg.author}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{msg.time}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Action Dock: Full Inline Comment Box or Decision Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#242730] flex flex-col gap-3">
                  {activeNotification.actionResolved ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                        <Check className="w-5 h-5" />
                        <span>Action successfully resolved ({activeNotification.actionResolvedState})</span>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                        Synced via WebSocket
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Pull Request Decision */}
                      {activeNotification.actionType === 'approve_pr' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => resolveAction(activeNotification.id, 'approved')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Approve Pull Request
                          </button>
                          <button
                            onClick={() => resolveAction(activeNotification.id, 'changes_requested')}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs transition-all active:scale-95"
                          >
                            Request Changes
                          </button>
                          <a
                            href={activeNotification.targetEntity?.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open on GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Workspace Invite Decision */}
                      {activeNotification.actionType === 'accept_decline' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => resolveAction(activeNotification.id, 'accepted')}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Accept & Join Workspace
                          </button>
                          <button
                            onClick={() => resolveAction(activeNotification.id, 'declined')}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs transition-all active:scale-95"
                          >
                            Decline Invitation
                          </button>
                        </div>
                      )}

                      {/* Security Alert Decision */}
                      {activeNotification.actionType === 'security_action' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => resolveAction(activeNotification.id, 'session_terminated')}
                            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
                          >
                            <ShieldAlert className="w-4 h-4" /> Terminate Suspicious Session
                          </button>
                          <button
                            onClick={() => resolveAction(activeNotification.id, 'verified_safe')}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs transition-all"
                          >
                            Mark As Authorized
                          </button>
                        </div>
                      )}

                      {/* Inline Thread Reply Input Box */}
                      {activeNotification.actionType === 'quick_reply' && (
                        <form onSubmit={handleSendDetailReply} className="flex flex-col gap-2">
                          <textarea
                            rows={3}
                            value={commentReplyText}
                            onChange={(e) => setCommentReplyText(e.target.value)}
                            placeholder={`Reply to ${activeNotification.actor?.name}... (Ctrl+Enter to send)`}
                            className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                            onKeyDown={(e) => {
                              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                handleSendDetailReply(e);
                              }
                            }}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[10px]">Ctrl+Enter</kbd> to dispatch
                            </span>
                            <button
                              type="submit"
                              disabled={isSendingReply || !commentReplyText.trim()}
                              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-3">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Select a notification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Choose an item from the left column or use J/K keyboard shortcuts to triage rapidly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
