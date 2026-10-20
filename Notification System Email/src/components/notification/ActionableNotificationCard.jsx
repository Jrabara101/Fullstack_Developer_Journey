import React, { useState } from 'react';
import { 
  MessageSquare, 
  GitPullRequest, 
  ShieldAlert, 
  CreditCard, 
  Sparkles, 
  UserPlus, 
  Check, 
  CornerDownRight, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItemHoverActions } from './NotificationItemHoverActions';

export const ActionableNotificationCard = ({ 
  notification, 
  isSelected = false, 
  onSelect = () => {}, 
  selectable = false,
  isChecked = false,
  onCheckToggle = () => {},
  compact = false 
}) => {
  const { resolveAction, markAsRead, setAuditTarget, setEmailPreviewTarget } = useNotifications();
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Category Icon & Color Mapping
  const getCategoryBadge = () => {
    switch (notification.category) {
      case 'collaboration':
        if (notification.targetEntity?.type === 'pull_request') {
          return {
            icon: GitPullRequest,
            color: 'bg-purple-500 text-white',
            border: 'border-purple-600',
          };
        }
        if (notification.targetEntity?.type === 'workspace_invite') {
          return {
            icon: UserPlus,
            color: 'bg-blue-500 text-white',
            border: 'border-blue-600',
          };
        }
        return {
          icon: MessageSquare,
          color: 'bg-blue-600 text-white',
          border: 'border-blue-700',
        };
      case 'security':
        return {
          icon: ShieldAlert,
          color: 'bg-red-500 text-white',
          border: 'border-red-600',
        };
      case 'billing':
        return {
          icon: CreditCard,
          color: 'bg-amber-500 text-white',
          border: 'border-amber-600',
        };
      case 'product':
      default:
        return {
          icon: Sparkles,
          color: 'bg-indigo-500 text-white',
          border: 'border-indigo-600',
        };
    }
  };

  const badge = getCategoryBadge();
  const BadgeIcon = badge.icon;

  // Format relative time concisely
  const formatTime = (isoString) => {
    if (!isoString) return 'now';
    const deltaMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(deltaMs / (60 * 1000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d`;
  };

  const handleQuickReplySubmit = (e) => {
    e.stopPropagation();
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    setTimeout(() => {
      resolveAction(notification.id, 'replied');
      setIsSubmittingReply(false);
      setShowReplyInput(false);
    }, 150);
  };

  return (
    <div
      onClick={() => {
        markAsRead(notification.id);
        onSelect(notification.id);
      }}
      className={`group relative flex items-start gap-3 p-3 transition-all duration-150 cursor-pointer border-b border-slate-100 dark:border-[#242730]/60 ${
        isSelected
          ? 'bg-blue-50/60 dark:bg-blue-950/25 ring-1 ring-blue-500/40 dark:ring-blue-500/30'
          : !notification.isRead
          ? 'bg-white dark:bg-[#131418] hover:bg-slate-50 dark:hover:bg-[#191B20]'
          : 'bg-slate-50/40 dark:bg-[#0E0F13]/70 hover:bg-slate-100/60 dark:hover:bg-[#15171D]'
      }`}
    >
      {/* Optional Batch Checkbox */}
      {selectable && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onCheckToggle(notification.id);
          }}
          className="pt-1"
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {}}
            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 cursor-pointer"
          />
        </div>
      )}

      {/* Avatar with Category Badge */}
      <div className="relative shrink-0">
        {notification.actor?.avatar ? (
          <img
            src={notification.actor.avatar}
            alt={notification.actor.name}
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-zinc-800 shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center font-semibold text-xs shadow-sm ring-1 ring-slate-300 dark:ring-zinc-700">
            {notification.category === 'security' ? (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            ) : notification.category === 'billing' ? (
              <CreditCard className="w-4 h-4 text-amber-500" />
            ) : (
              notification.actor?.name?.slice(0, 2).toUpperCase() || 'SYS'
            )}
          </div>
        )}

        {/* Small Bottom-Right Category Badge */}
        <span
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${badge.color} ring-2 ring-white dark:ring-[#131418] shadow-sm`}
        >
          <BadgeIcon className="w-2.5 h-2.5" />
        </span>
      </div>

      {/* Narrative Center Stack */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-baseline justify-between gap-1 mb-0.5">
          <p
            className={`text-[13px] leading-tight truncate ${
              !notification.isRead
                ? 'font-semibold text-slate-900 dark:text-slate-100'
                : 'font-normal text-slate-700 dark:text-slate-300'
            }`}
          >
            {notification.actor?.name && (
              <span className="font-semibold text-slate-900 dark:text-white mr-1">
                {notification.actor.name}
              </span>
            )}
            <span className="text-slate-600 dark:text-slate-400">
              {notification.title.replace(notification.actor?.name || '', '').trim()}
            </span>
          </p>
        </div>

        {/* Truncated Body Excerpt */}
        <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
          {notification.body}
        </p>

        {/* Target Entity Tag or Escalation Indicator */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
          {notification.targetEntity?.name && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
              {notification.targetEntity.name}
            </span>
          )}

          {notification.metadata?.escalationPending && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-medium text-[10px] border border-amber-200 dark:border-amber-800/40">
              <Clock className="w-2.5 h-2.5" /> Escalates to email in 2m
            </span>
          )}

          {notification.metadata?.isAggregatedDigest && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium text-[10px] border border-blue-200 dark:border-blue-800/40">
              <Sparkles className="w-2.5 h-2.5" /> Fatigue Shield Batch
            </span>
          )}
        </div>

        {/* Polymorphic Inline Action Slot */}
        <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
          {notification.actionResolved ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 animate-fade-in">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span className="capitalize">{notification.actionResolvedState || 'Resolved'}</span>
            </div>
          ) : (
            <>
              {/* Approve / Reject Pull Request */}
              {notification.actionType === 'approve_pr' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resolveAction(notification.id, 'approved')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] shadow-sm transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => resolveAction(notification.id, 'changes_requested')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-[11px] transition-all active:scale-95"
                  >
                    Request Changes
                  </button>
                </div>
              )}

              {/* Accept / Decline Workspace Invite */}
              {notification.actionType === 'accept_decline' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resolveAction(notification.id, 'accepted')}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] shadow-sm transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Accept Invite
                  </button>
                  <button
                    onClick={() => resolveAction(notification.id, 'declined')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-[11px] transition-all active:scale-95"
                  >
                    Decline
                  </button>
                </div>
              )}

              {/* Inline Quick Reply Input */}
              {notification.actionType === 'quick_reply' && (
                <div>
                  {!showReplyInput ? (
                    <button
                      onClick={() => setShowReplyInput(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-[11px] transition-all"
                    >
                      <CornerDownRight className="w-3 h-3" /> Reply in place
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 w-full max-w-sm mt-1 animate-fade-in">
                      <input
                        type="text"
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickReplySubmit(e)}
                        placeholder="Write a quick reply..."
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        disabled={isSubmittingReply || !replyText.trim()}
                        onClick={handleQuickReplySubmit}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[11px] font-medium flex items-center gap-1 transition-all"
                      >
                        <Send className="w-2.5 h-2.5" /> Send
                      </button>
                      <button
                        onClick={() => setShowReplyInput(false)}
                        className="px-1.5 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Security Review Session */}
              {notification.actionType === 'security_action' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resolveAction(notification.id, 'session_terminated')}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] shadow-sm transition-all active:scale-95 flex items-center gap-1"
                  >
                    Terminate Session
                  </button>
                  <button
                    onClick={() => resolveAction(notification.id, 'verified_safe')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-[11px] transition-all"
                  >
                    It Was Me
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Timestamp & Blue Unread Dot OR Hover Action Strip */}
      <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
        {/* Default State: Timestamp + 8px electric blue dot */}
        <div className="flex items-center gap-1.5 group-hover:opacity-0 transition-opacity duration-100">
          <span className="font-mono text-[11px] text-slate-400 dark:text-[#8F9CAE] tabular-nums">
            {formatTime(notification.createdAt)}
          </span>
          {!notification.isRead && (
            <span
              title="Unread"
              className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 shadow-sm"
            />
          )}
        </div>

        {/* Hover Action Strip (Replaces timestamp on row hover smoothly) */}
        <div className="absolute top-2.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
          <NotificationItemHoverActions
            notification={notification}
            onOpenAudit={() => setAuditTarget(notification)}
            onOpenEmail={() => setEmailPreviewTarget(notification)}
          />
        </div>
      </div>
    </div>
  );
};
