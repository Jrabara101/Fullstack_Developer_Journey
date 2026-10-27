// ============================================================================
// Top Horizon Ribbon & Workspace Navigation Bar
// Live Quota Horizon, Multi-Dimensional View Switcher & Action Center
// ============================================================================

import React from 'react';
import { 
  Kanban, 
  Table2, 
  BarChart3, 
  Radio, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  AlertTriangle,
  HelpCircle,
  Command,
  Sparkles
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency } from '../../utils/crmUtils';

export default function Navbar() {
  const {
    deals,
    activeView,
    setActiveView,
    rottingFilterActive,
    setRottingFilterActive,
    theme,
    setTheme,
    setIsCommandPaletteOpen,
    setIsNewDealModalOpen,
    setIsShortcutsModalOpen,
    contacts
  } = useCRM();

  // Calculate live financial horizon metrics
  const quotaTargetCents = 120000000; // $1,200,000

  const closedWonCents = deals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + d.amount_cents, 0);

  const weightedCommitCents = deals
    .filter(d => d.stage !== 'closed_lost' && d.stage !== 'closed_won')
    .reduce((sum, d) => sum + Math.round(d.amount_cents * (d.win_probability / 100)), 0);

  const totalOpenPipelineCents = deals
    .filter(d => d.stage !== 'closed_lost' && d.stage !== 'closed_won')
    .reduce((sum, d) => sum + d.amount_cents, 0);

  const openDealsCount = deals.filter(d => d.stage !== 'closed_lost' && d.stage !== 'closed_won').length;

  const quotaProgressPct = Math.min(100, Math.round((closedWonCents / quotaTargetCents) * 100));
  const commitProgressPct = Math.min(100, Math.round(((closedWonCents + weightedCommitCents) / quotaTargetCents) * 100));

  // Count contacts in reconnect queue (cooling/cold > 21 days)
  const reconnectCount = contacts.filter(c => {
    const daysSince = Math.floor((Date.now() - new Date(c.last_interaction_at || 0)) / (86400 * 1000));
    return daysSince > (c.keep_in_touch_days || 21);
  }).length;

  return (
    <header className="sticky top-0 z-30 border-b border-hairline-light dark:border-hairline-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md">
      {/* 4-Segment Live Horizon Bar */}
      <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-hairline-light/60 dark:border-hairline-dark/60 bg-surface-elevated-light dark:bg-surface-elevated-dark">
        {/* Left: Financial Rollup Metrics */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px]">Q4 Target</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(quotaTargetCents)}
            </span>
          </div>

          <div className="h-4 w-px bg-hairline-light dark:bg-hairline-dark hidden sm:block" />

          {/* Closed Won Horizon */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-slate-400 dark:text-slate-500 font-medium">Closed Won:</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(closedWonCents)}
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {quotaProgressPct}%
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-hairline-light dark:bg-hairline-dark hidden md:block" />

          {/* Weighted Commit Horizon */}
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cobalt-signal" />
            <span className="text-slate-400 dark:text-slate-500 font-medium">Weighted Commit:</span>
            <span className="font-mono font-semibold text-cobalt-signal tabular-nums">
              {formatCurrency(weightedCommitCents)}
            </span>
          </div>

          <div className="h-4 w-px bg-hairline-light dark:bg-hairline-dark hidden lg:block" />

          {/* Open Pipeline Horizon */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Open Pipeline:</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
              {formatCurrency(totalOpenPipelineCents)}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
              ({openDealsCount} deals)
            </span>
          </div>
        </div>

        {/* Right: Quick Command & Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Rotting Deals Toggle Filter */}
          <button
            onClick={() => setRottingFilterActive(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
              rottingFilterActive
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-amber-glow'
                : 'border-hairline-light dark:border-hairline-dark text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark'
            }`}
            title="Toggle Rotting Deals Sentinel (R)"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${rottingFilterActive ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <span>Rotting Deals</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 font-mono text-[9px] bg-slate-200/50 dark:bg-slate-800 rounded text-slate-500">R</kbd>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1 text-xs text-slate-500 dark:text-slate-400 bg-surface-light dark:bg-surface-dark border border-hairline-light dark:border-hairline-dark rounded-lg hover:border-brand/40 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search or jump...</span>
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 rounded border border-hairline-light dark:border-hairline-dark">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg border border-hairline-light dark:border-hairline-dark text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-elevated-dark transition-colors"
            title="Toggle Dark/Light Mode (T)"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Shortcuts Help */}
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="p-1.5 rounded-lg border border-hairline-light dark:border-hairline-dark text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-elevated-dark transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* New Deal Primary Button */}
          <button
            onClick={() => setIsNewDealModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand hover:bg-brand-hover text-white shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 font-mono text-[9px] bg-indigo-700/60 rounded text-indigo-100">C</kbd>
          </button>
        </div>
      </div>

      {/* Horizon Progress Bar Visual */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800/80 relative overflow-hidden">
        {/* Closed Won Progress */}
        <div
          className="h-full bg-emerald-500 absolute left-0 top-0 transition-all duration-500"
          style={{ width: `${quotaProgressPct}%` }}
        />
        {/* Weighted Commit Layer */}
        <div
          className="h-full bg-cobalt-signal/70 absolute top-0 transition-all duration-500"
          style={{ left: `${quotaProgressPct}%`, width: `${Math.max(0, commitProgressPct - quotaProgressPct)}%` }}
        />
      </div>

      {/* Main Workspace Navigation Sub-Bar */}
      <div className="px-5 py-2.5 flex items-center justify-between gap-4">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-dark p-1 rounded-xl border border-hairline-light dark:border-hairline-dark text-xs">
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'kanban'
                ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Pipeline</span>
          </button>

          <button
            onClick={() => setActiveView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'grid'
                ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Relational Grid</span>
          </button>

          <button
            onClick={() => setActiveView('forecast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'forecast'
                ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Revenue Simulator</span>
          </button>

          <button
            onClick={() => setActiveView('reconnect')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'reconnect'
                ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>Reconnect Queue</span>
            {reconnectCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                {reconnectCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Info: Zero-Admin Status & Network Status */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Self-Updating Active</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] font-mono text-slate-500">Auto-Enrichment Ready</span>
        </div>
      </div>
    </header>
  );
}
