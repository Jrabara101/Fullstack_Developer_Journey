import React from 'react';
import { Check, CheckCheck, Archive, BellOff, Info, Mail } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationItemHoverActions = ({ notification, onOpenAudit, onOpenEmail }) => {
  const { markAsRead, markAsUnread, archiveNotification, snoozeNotification } = useNotifications();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1 bg-white/90 dark:bg-[#191B20]/95 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm"
    >
      {notification.isRead ? (
        <button
          onClick={() => markAsUnread(notification.id)}
          title="Mark as unread"
          className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="w-3.5 h-3.5 rounded-full border border-current" />
        </button>
      ) : (
        <button
          onClick={() => markAsRead(notification.id)}
          title="Mark as read"
          className="p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={() => archiveNotification(notification.id)}
        title="Archive"
        className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Archive className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => snoozeNotification(notification.id, 180)}
        title="Snooze for 3 hours"
        className="p-1 rounded text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <BellOff className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => onOpenEmail?.(notification)}
        title="Preview transactional email"
        className="p-1 rounded text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Mail className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => onOpenAudit?.(notification)}
        title="Why did I receive this? (Audit Log)"
        className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
