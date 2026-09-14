import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  Bell,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Command
} from 'lucide-react';
import NotificationsDrawer from './NotificationsDrawer';

export default function Header({
  onOpenCommandPalette,
  notifications,
  onNotificationAction,
  activeDateRange,
  setActiveDateRange
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const dateRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.type === 'interruptive').length;

  const dateRanges = [
    'Today (Real-time)',
    'Last 7 Days',
    'Oct 1 - Oct 31, 2024',
    'Last 90 Days',
    'Custom Range...'
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-surface-container-lowest z-30 border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.03)] px-6 flex items-center justify-between gap-4 select-none">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-outline min-w-max">
        <span className="hover:text-on-surface transition-colors cursor-pointer">Workspaces</span>
        <span className="text-outline-variant">/</span>
        <span className="hover:text-on-surface transition-colors cursor-pointer">US-East-1</span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface font-semibold">Overview</span>
      </div>

      {/* Global Cmd + K Search Trigger */}
      <div className="flex-1 max-w-lg mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-9 pl-3 pr-2.5 bg-surface-container-low hover:bg-surface-container rounded-lg text-xs text-left text-outline flex items-center justify-between transition-colors group cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
            <span className="truncate">Search operations, users, logs, or quick actions...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="font-mono text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded shadow-xs border border-surface-container-highest">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        {/* Date Range Picker Dropdown */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="h-8 px-2.5 flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg text-xs transition-colors cursor-pointer font-medium"
          >
            <Calendar className="w-3.5 h-3.5 text-outline" />
            <span>{activeDateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-outline" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-1 w-52 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-outline">
                Select Timeframe
              </div>
              {dateRanges.map(range => (
                <button
                  key={range}
                  onClick={() => {
                    setActiveDateRange(range);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                    activeDateRange === range
                      ? 'bg-primary-container text-on-primary font-medium'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span>{range}</span>
                  {activeDateRange === range && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <NotificationsDrawer
              notifications={notifications}
              onAction={onNotificationAction}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* Help icon */}
        <button
          onClick={() => alert("Apex v4.2 Command Center Documentation: Check system telemetry, regional nodes, or use ⌘K to trigger fast workflows.")}
          className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
          title="System Documentation & Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-surface-container"></div>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-medium text-xs ring-2 ring-surface-container">
              OA
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-on-surface leading-tight">Ops Lead</div>
              <div className="text-[10px] text-outline font-mono">admin@apex.io</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-outline" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 border-b border-surface-container-low">
                <div className="text-xs font-bold text-on-surface">Alexandre Vance</div>
                <div className="text-[11px] text-outline font-mono">Superadmin Privileges</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Security & 2FA
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Switch Workspace
                </button>
              </div>
              <div className="border-t border-surface-container-low py-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-error hover:bg-error-container/20 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
