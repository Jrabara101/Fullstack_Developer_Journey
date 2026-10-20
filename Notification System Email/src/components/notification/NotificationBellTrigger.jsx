import React, { useState, useEffect } from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationBellTrigger = ({ isOpen, onToggle }) => {
  const { unreadCount, badgeTriggerKey, connectionStatus, wsLatencyMs } = useNotifications();
  const [isPopping, setIsPopping] = useState(false);

  // Trigger scale bounce animation whenever a new notification arrives
  useEffect(() => {
    if (badgeTriggerKey > 0) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 250);
      return () => clearTimeout(timer);
    }
  }, [badgeTriggerKey]);

  return (
    <div className="relative inline-flex items-center">
      <button
        id="notification-bell-button"
        onClick={onToggle}
        aria-label="Toggle notifications flyout"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          isOpen
            ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Bell className="w-5 h-5 transition-transform active:scale-95" />

        {/* Live Unread Counter Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-bold text-white rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#0A0B0E] transition-transform duration-200 ${
              isPopping ? 'scale-125 shadow-blue-500/50 shadow-lg' : 'scale-100'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Tiny Real-Time Connection Indicator Pip */}
      <span
        title={`WebSocket status: ${connectionStatus} (${wsLatencyMs}ms)`}
        className={`absolute -bottom-0.5 right-1 w-2 h-2 rounded-full ring-1 ring-white dark:ring-[#0A0B0E] ${
          connectionStatus === 'connected'
            ? 'bg-emerald-500'
            : connectionStatus === 'polling_fallback'
            ? 'bg-amber-500 animate-pulse'
            : 'bg-red-500'
        }`}
      />
    </div>
  );
};
