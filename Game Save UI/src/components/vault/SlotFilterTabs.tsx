import React from 'react';
import { Search, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { sfx } from '../../sounds/sfx';

export type FilterCategory = 'all' | 'manual' | 'auto' | 'locked';

interface SlotFilterTabsProps {
  currentCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  counts: { all: number; manual: number; auto: number; locked: number };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isAutoSaveEnabled: boolean;
  onToggleAutoSave: () => void;
  onNewManualSave: () => void;
}

export const SlotFilterTabs: React.FC<SlotFilterTabsProps> = ({
  currentCategory,
  onSelectCategory,
  counts,
  searchQuery,
  onSearchChange,
  isAutoSaveEnabled,
  onToggleAutoSave,
  onNewManualSave
}) => {
  const tabs: { id: FilterCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Saves', count: counts.all },
    { id: 'manual', label: 'Manual', count: counts.manual },
    { id: 'auto', label: 'Auto-Saves', count: counts.auto },
    { id: 'locked', label: 'Timeline Locked', count: counts.locked }
  ];

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0D121F]/80 border border-[#1E293B] rounded-xl p-3 shadow-lg">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#07090E]/90 rounded-lg border border-slate-800/80 w-full md:w-auto overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sfx.playClick();
                onSelectCategory(tab.id);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 select-none uppercase ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-cyan-400/20 text-cyan-200' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Search bar + Auto-save toggle + New Save */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Search input */}
        <div className="relative w-full sm:w-56">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chapter, biome..."
            className="w-full bg-[#07090E] border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
          />
        </div>

        {/* Auto-save toggle */}
        <button
          onClick={onToggleAutoSave}
          title="Toggle Background Rolling Triple-Buffer Auto-Saves"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#07090E] border border-slate-800 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
        >
          {isAutoSaveEnabled ? (
            <ToggleRight size={18} className="text-emerald-400" />
          ) : (
            <ToggleLeft size={18} className="text-slate-600" />
          )}
          <span className="text-[11px] hidden lg:inline">
            AUTO-SAVE: {isAutoSaveEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Manual Save New Checkpoint */}
        <Button variant="cyan" size="sm" onClick={onNewManualSave}>
          <Plus size={14} />
          <span>NEW SAVE</span>
        </Button>
      </div>
    </div>
  );
};
