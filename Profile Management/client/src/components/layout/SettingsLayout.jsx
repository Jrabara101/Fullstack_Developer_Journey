import React, { useState } from 'react';
import {
  User, Shield, Sliders, Globe, Trash2, Eye, Sun, Moon,
  Monitor, ExternalLink, Menu, X, Sparkles, AlertCircle
} from 'lucide-react';
import { generateGradientAvatar } from '../../services/avatarGenerator';

export const SECTIONS = [
  { id: 'profile', label: 'General Profile', icon: User, desc: 'Identity, bio, media and persona' },
  { id: 'account', label: 'Account & Security', icon: Shield, desc: 'Email, telephone, and passkeys' },
  { id: 'preferences', label: 'Preferences & Locale', icon: Sliders, desc: 'Timezones, quiet hours & theme' },
  { id: 'privacy', label: 'Audience & Privacy', icon: Globe, desc: 'Field-level visibility & indexing' },
  { id: 'data', label: 'Data & Deactivation', icon: Trash2, desc: 'Takeout export & account lifecycle' },
];

export function SettingsLayout({
  activeSection,
  onSectionChange,
  profile,
  theme,
  onThemeToggle,
  onOpenSimulator,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectiveAvatar = profile?.avatar_url || generateGradientAvatar(profile?.display_name || 'Alex');

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-blue-600">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border-light dark:border-border-dark bg-white/80 dark:bg-[#0A0B0E]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Platform Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
                A
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight">Atelier ID</span>
                <span className="text-slate-400 text-xs ml-1.5 hidden sm:inline-block font-mono">
                  / settings
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live "View Profile As" trigger */}
            <button
              type="button"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Preview how your profile appears to different audiences"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview Public Profile</span>
              <span className="sm:hidden">Preview</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onThemeToggle}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Switch theme (Current: ${theme})`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-8">
        {/* Left Navigation Rail (240px Desktop) */}
        <aside
          aria-label="Settings navigation rail"
          className={`md:w-60 flex-shrink-0 space-y-6 ${
            mobileMenuOpen ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Mini User Identity Capsule */}
          <div className="p-3.5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] shadow-sm flex items-center gap-3">
            <img
              src={effectiveAvatar}
              alt={profile?.display_name || 'User'}
              className="w-9 h-9 rounded-full ring-2 ring-blue-500/30 object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {profile?.display_name || 'Alex Vance'}
              </p>
              <p className="text-[11px] text-text-muted font-mono truncate">
                @{profile?.username || 'alexvance'}
              </p>
            </div>
            {profile?.account_status === 'quarantined' && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Account Quarantined" />
            )}
            {profile?.account_status === 'pending_deletion' && (
              <span className="w-2 h-2 rounded-full bg-rose-500" title="Pending Deletion" />
            )}
          </div>

          {/* Section Navigation Items */}
          <nav aria-label="Settings sections" className="space-y-1">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    onSectionChange(sec.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm border border-blue-100 dark:border-blue-900/40 relative'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {/* Active Indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Helper Widget */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121418] border border-border-light/60 dark:border-border-dark/60 text-[11px] text-text-muted space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Identity Sovereignty</span>
            </div>
            <p className="leading-snug">
              Every data point is cryptographically protected with strict Row-Level Security.
            </p>
          </div>
        </aside>

        {/* Center Main Content Column (max-w-2xl w-full mx-auto) */}
        <main className="flex-1 max-w-3xl w-full pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
