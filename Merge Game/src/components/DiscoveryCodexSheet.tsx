// ----------------------------------------------------
// Discovery Codex Sheet: Branching Evolution Archive
// ----------------------------------------------------

import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { CODEX_ENTRIES, getTierColor } from '../engine/codex';
import { ItemIcon } from './ItemIcons';
import { X, BookOpen, Lock, Sparkles } from 'lucide-react';

export const DiscoveryCodexSheet: React.FC = () => {
  const { isCodexOpen, setIsCodexOpen, unlockedTiers, unlockedCategories } = useGameStore();
  const [activeTab, setActiveTab] = useState<'all' | 'linear' | 'branching'>('all');

  if (!isCodexOpen) return null;

  const filteredEntries = CODEX_ENTRIES.filter(entry => {
    if (activeTab === 'linear') return !entry.category.startsWith('branch_') && entry.category !== 'catalyst';
    if (activeTab === 'branching') return entry.category.startsWith('branch_') || entry.category === 'catalyst';
    return true;
  });

  const unlockedCount = CODEX_ENTRIES.filter(
    e => unlockedTiers.has(e.tier) || unlockedCategories.has(e.category)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Alchemical Codex</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {unlockedCount} / {CODEX_ENTRIES.length} Discovered
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transmutation trees, mythic awakenings, and lore archive.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCodexOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Relics
          </button>
          <button
            onClick={() => setActiveTab('linear')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'linear'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Main Tiers (1–12)
          </button>
          <button
            onClick={() => setActiveTab('branching')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'branching'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mythic Branches & Catalysts
          </button>
        </div>

        {/* Scrollable Codex Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredEntries.map(entry => {
            const isUnlocked = unlockedTiers.has(entry.tier) || unlockedCategories.has(entry.category);
            const colors = getTierColor(entry.tier, entry.category);

            if (!isUnlocked) {
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex items-center gap-3 opacity-60"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-500">
                      Tier {entry.tier} // ???
                    </div>
                    <div className="text-xs text-slate-600 italic mt-0.5">
                      Transmute higher relics to discover.
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={entry.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${colors.bg} ${colors.glow} ${colors.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                    <ItemIcon tier={entry.tier} category={entry.category} className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-extrabold uppercase ${colors.text}`}>
                        Tier {entry.tier} • {entry.element}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        +{entry.stats.basePoints} PTS
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white truncate">{entry.name}</h3>
                    <p className="text-[11px] text-slate-300 italic mt-0.5">{entry.title}</p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {entry.lore}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-amber-300/90 font-medium">
                      💡 {entry.recipeDesc}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Discoveries persist permanently across runs</span>
          </div>
          <button
            onClick={() => setIsCodexOpen(false)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
