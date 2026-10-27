// ============================================================================
// Keyboard-First Command Palette (Cmd+K / Ctrl+K)
// Global Action Launcher across Deals, Companies, Contacts & Instant Stage Actions
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  Building2, 
  Users, 
  Plus, 
  Radio, 
  BarChart2, 
  Sun, 
  Moon, 
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, STAGE_CONFIG } from '../../utils/crmUtils';

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    deals,
    companies,
    contacts,
    setSelectedDealId,
    setActiveView,
    setIsNewDealModalOpen,
    setRottingFilterActive,
    setTheme,
    theme
  } = useCRM();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Filter deals, companies, contacts
  const matchedDeals = deals.filter(d => 
    !cleanQuery || d.title.toLowerCase().includes(cleanQuery) || d.deal_code.toLowerCase().includes(cleanQuery)
  ).slice(0, 4);

  const matchedCompanies = companies.filter(c => 
    !cleanQuery || c.name.toLowerCase().includes(cleanQuery) || c.domain.toLowerCase().includes(cleanQuery)
  ).slice(0, 3);

  const matchedContacts = contacts.filter(c => 
    !cleanQuery || `${c.first_name} ${c.last_name}`.toLowerCase().includes(cleanQuery) || c.email.toLowerCase().includes(cleanQuery)
  ).slice(0, 3);

  const handleSelectDeal = (dealId) => {
    setSelectedDealId(dealId);
    setIsCommandPaletteOpen(false);
  };

  const handleAction = (actionFn) => {
    actionFn();
    setIsCommandPaletteOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div 
        className="w-full max-w-xl rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-hairline-light dark:border-hairline-dark flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search deals, accounts, and people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 rounded border border-hairline-light dark:border-hairline-dark text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick System Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleAction(() => setIsNewDealModalOpen(true))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-3.5 h-3.5 text-brand" />
                  <span>Create New Deal</span>
                </div>
                <kbd className="font-mono text-[10px] text-slate-400">C</kbd>
              </button>

              <button
                onClick={() => handleAction(() => setActiveView('kanban'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Switch to Kanban Pipeline</span>
                </div>
                <kbd className="font-mono text-[10px] text-slate-400">V</kbd>
              </button>

              <button
                onClick={() => handleAction(() => setRottingFilterActive(prev => !prev))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Toggle Rotting Deals Sentinel</span>
                </div>
                <kbd className="font-mono text-[10px] text-slate-400">R</kbd>
              </button>

              <button
                onClick={() => handleAction(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  <span>Toggle Dark / Light Theme</span>
                </div>
                <kbd className="font-mono text-[10px] text-slate-400">T</kbd>
              </button>
            </div>
          </div>

          {/* Deals */}
          {matchedDeals.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Deals ({matchedDeals.length})
              </div>
              <div className="space-y-0.5">
                {matchedDeals.map((deal) => {
                  const comp = companies.find(c => c.id === deal.company_id);
                  return (
                    <button
                      key={deal.id}
                      onClick={() => handleSelectDeal(deal.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left text-slate-800 dark:text-slate-200 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm shrink-0">{comp?.favicon || '🏢'}</span>
                        <div className="truncate">
                          <span className="font-medium">{deal.title}</span>
                          <span className="text-slate-400 text-[10px] block font-mono">{deal.deal_code} • {STAGE_CONFIG[deal.stage]?.label}</span>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                        {formatCurrency(deal.amount_cents)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Companies */}
          {matchedCompanies.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Accounts ({matchedCompanies.length})
              </div>
              <div className="space-y-0.5">
                {matchedCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      const deal = deals.find(d => d.company_id === comp.id);
                      if (deal) handleSelectDeal(deal.id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{comp.favicon || '🏢'}</span>
                      <div>
                        <span className="font-semibold">{comp.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">{comp.domain} • {comp.employee_range}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800">
                      {comp.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with <kbd className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono">↑</kbd> <kbd className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono">↓</kbd></span>
          <span>Press <kbd className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono">Enter</kbd> to jump</span>
        </div>
      </div>
    </div>
  );
}
