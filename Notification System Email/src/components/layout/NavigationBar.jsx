import React, { useState } from 'react';
import { 
  Bell, 
  Inbox, 
  Settings, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Zap, 
  Layers, 
  Radio, 
  Activity,
  Sparkles,
  Command
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBellTrigger } from '../notification/NotificationBellTrigger';
import { NotificationFlyout } from '../notification/NotificationFlyout';

export const NavigationBar = ({ 
  currentView, 
  setCurrentView,
  onOpenSimulator,
  onOpenDiagnostics
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { 
    unreadCount, 
    connectionStatus, 
    wsLatencyMs, 
    soundEnabled, 
    setSoundEnabled 
  } = useNotifications();

  const [flyoutOpen, setFlyoutOpen] = useState(false);

  return (
    <header className="relative z-40 shrink-0 h-14 border-b border-slate-200 dark:border-[#242730] bg-white/90 dark:bg-[#0A0B0E]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-6">
        {/* Brand Mark */}
        <div 
          onClick={() => setCurrentView('inbox')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Stitch Pulse
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Omni-Channel Notification Center
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#131418] p-1 rounded-xl border border-slate-200/80 dark:border-[#242730]">
          <button
            onClick={() => setCurrentView('inbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'inbox'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Triage Inbox</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'settings'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences Matrix</span>
          </button>
        </nav>
      </div>

      {/* Right Controls & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Connection Telemetry Badge */}
        <div
          title={`Transport: WebSocket (${wsLatencyMs}ms)`}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#131418] border border-slate-200 dark:border-[#242730] text-[11px] font-mono text-slate-500"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : connectionStatus === 'polling_fallback'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {connectionStatus === 'connected' ? 'WS Live' : 'Polling'}
          </span>
          <span className="text-slate-400">({wsLatencyMs}ms)</span>
        </div>

        {/* Live Simulator Button */}
        <button
          onClick={onOpenSimulator}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 text-xs font-semibold shadow-sm transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Simulate Event</span>
        </button>

        {/* BullMQ Diagnostics Button */}
        <button
          onClick={onOpenDiagnostics}
          title="Inspect BullMQ & Redis queues"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Audio Chime Mute/Unmute */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute sound chimes' : 'Unmute sound chimes'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle light/dark theme"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* In-App Bell Trigger & Flyout Container (Blueprint A) */}
        <div className="relative">
          <NotificationBellTrigger
            isOpen={flyoutOpen}
            onToggle={() => setFlyoutOpen(!flyoutOpen)}
          />

          <NotificationFlyout
            isOpen={flyoutOpen}
            onClose={() => setFlyoutOpen(false)}
            onNavigateToInbox={() => {
              setCurrentView('inbox');
              setFlyoutOpen(false);
            }}
            onNavigateToSettings={() => {
              setCurrentView('settings');
              setFlyoutOpen(false);
            }}
          />
        </div>
      </div>
    </header>
  );
};
