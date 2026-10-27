// ============================================================================
// Left Navigation Rail (Collapsible 240px Workspace Rail)
// Object Switcher, Saved Smart Views & Live Job-Change Radar
// ============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Layers, 
  Flame, 
  AlertTriangle, 
  Gem, 
  Users2, 
  Sparkles, 
  ChevronDown, 
  Radio, 
  BarChart2, 
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export default function Sidebar() {
  const {
    companies,
    contacts,
    deals,
    activeView,
    setActiveView,
    rottingFilterActive,
    setRottingFilterActive,
    setIsCommandPaletteOpen,
    jobChangeAlerts,
    setIsJobChangeModalOpen
  } = useCRM();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSmartView, setActiveSmartView] = useState('all');

  // Counts for objects
  const activeDealsCount = deals.filter(d => d.stage !== 'closed_lost').length;
  const companiesCount = companies.length;
  const contactsCount = contacts.length;

  const handleSmartViewClick = (viewId) => {
    setActiveSmartView(viewId);
    if (viewId === 'rotting') {
      setRottingFilterActive(true);
      setActiveView('kanban');
    } else {
      setRottingFilterActive(false);
      setActiveView('kanban');
    }
  };

  if (isCollapsed) {
    return (
      <aside className="w-14 shrink-0 border-r border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark flex flex-col items-center py-4 justify-between transition-all duration-200">
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm shadow-xs"
            title="Expand Sidebar"
          >
            A
          </button>
          <div className="h-px w-6 bg-hairline-light dark:bg-hairline-dark" />
          <button
            onClick={() => setActiveView('kanban')}
            className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white ${activeView === 'kanban' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-brand dark:text-brand-dark' : ''}`}
            title="Pipeline"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('grid')}
            className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white ${activeView === 'grid' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-brand dark:text-brand-dark' : ''}`}
            title="Relational Grid"
          >
            <Building2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('reconnect')}
            className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white ${activeView === 'reconnect' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-brand dark:text-brand-dark' : ''}`}
            title="Reconnect Queue"
          >
            <Radio className="w-4 h-4 text-amber-500" />
          </button>
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Expand"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-60 shrink-0 border-r border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark flex flex-col justify-between select-none transition-all duration-200">
      <div className="p-3.5 space-y-5">
        {/* Workspace Brand & Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
              Æ
            </div>
            <div>
              <div className="flex items-center gap-1 font-semibold text-xs text-slate-900 dark:text-slate-100">
                <span>Aether Workspace</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Enterprise Growth Pod</p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Search Jump Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-400 bg-surface-elevated-light dark:bg-surface-elevated-dark border border-hairline-light dark:border-hairline-dark rounded-lg hover:border-brand/40 transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px]">Jump to record...</span>
          </div>
          <kbd className="px-1.5 py-0.2 font-mono text-[9px] bg-slate-100 dark:bg-slate-800 rounded border border-hairline-light dark:border-hairline-dark text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Core Objects */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Workspace Objects
          </p>

          <button
            onClick={() => { setActiveView('kanban'); setRottingFilterActive(false); }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'kanban' && !rottingFilterActive
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-brand dark:text-brand-dark'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Deals Pipeline</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{activeDealsCount}</span>
          </button>

          <button
            onClick={() => setActiveView('grid')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'grid'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-brand dark:text-brand-dark'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Companies (Accounts)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{companiesCount}</span>
          </button>

          <button
            onClick={() => setActiveView('grid')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>People (Contacts)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{contactsCount}</span>
          </button>

          <button
            onClick={() => setActiveView('reconnect')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'reconnect'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-amber-500" />
              <span>Reconnect Queue</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400">
              5
            </span>
          </button>

          <button
            onClick={() => setActiveView('forecast')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'forecast'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-brand dark:text-brand-dark'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <span>Revenue Forecast</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">Q4 live</span>
          </button>
        </div>

        {/* Saved Smart Views */}
        <div className="space-y-1 pt-1">
          <p className="px-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Saved Smart Views
          </p>

          <button
            onClick={() => handleSmartViewClick('closing_month')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
              activeSmartView === 'closing_month' && !rottingFilterActive
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-brand dark:text-brand-dark'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">🔥 Closing This Month</span>
          </button>

          <button
            onClick={() => handleSmartViewClick('rotting')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
              rottingFilterActive
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">⚠️ Rotting Deals (&gt;10d)</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </button>

          <button
            onClick={() => handleSmartViewClick('enterprise')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark transition-colors"
          >
            <Gem className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span className="truncate">💎 Enterprise ($50k+)</span>
          </button>

          <button
            onClick={() => handleSmartViewClick('warm_intros')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated-dark transition-colors"
          >
            <Users2 className="w-3.5 h-3.5 text-cobalt-signal shrink-0" />
            <span className="truncate">🤝 Warm Intro Available</span>
          </button>
        </div>
      </div>

      {/* Bottom: Job Change Radar Alert Widget */}
      {jobChangeAlerts.length > 0 && (
        <div className="p-3 border-t border-hairline-light dark:border-hairline-dark">
          <div 
            onClick={() => setIsJobChangeModalOpen(true)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/25 hover:border-indigo-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Job Change Radar
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            </div>
            <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
              {jobChangeAlerts[0].contact_name} moved to <span className="font-semibold text-indigo-500">{jobChangeAlerts[0].new_company}</span>!
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 group-hover:underline">
              <span>View Expansion Path</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
