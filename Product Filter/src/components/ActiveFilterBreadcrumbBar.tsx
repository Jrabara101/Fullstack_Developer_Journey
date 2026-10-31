import React, { useState } from 'react';
import { FilterQueryState } from '../types';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { X, RotateCcw, Bookmark, Share2, Check } from 'lucide-react';

interface ActiveFilterBreadcrumbBarProps {
  filterState: FilterQueryState;
  onFilterChange: (patch: Partial<FilterQueryState>) => void;
  onResetAll: () => void;
  totalMatched: number;
}

export const ActiveFilterBreadcrumbBar: React.FC<ActiveFilterBreadcrumbBarProps> = ({
  filterState,
  onFilterChange,
  onResetAll,
  totalMatched,
}) => {
  const { savedPresets, savePreset, setShortlistModalOpen } = useDiscoveryStore();
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetSavedFeedback, setPresetSavedFeedback] = useState(false);

  const hasActiveFilters =
    filterState.q ||
    filterState.categories.length > 0 ||
    filterState.brands.length > 0 ||
    filterState.priceRangeCents[0] > 5000 ||
    filterState.priceRangeCents[1] < 450000 ||
    filterState.minRating > 0 ||
    filterState.inStockOnly ||
    filterState.historicalLowOnly ||
    Object.keys(filterState.specFilters).length > 0;

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    savePreset(presetName.trim(), filterState);
    setPresetName('');
    setIsSavingPreset(false);
    setPresetSavedFeedback(true);
    setTimeout(() => setPresetSavedFeedback(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-[#080A0F] border-b border-[#1E2638]">
      {/* Active Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1">
        <span className="text-xs font-mono text-slate-500 mr-1">
          <strong className="text-slate-200 font-mono">{totalMatched}</strong> MATCHES:
        </span>

        {/* Categories */}
        {filterState.categories.map((cat) => (
          <span
            key={cat}
            className="inline-flex items-center gap-1 text-xs font-mono bg-[#171D2B] text-slate-200 border border-[#1E2638] px-2 py-0.5 rounded-md hover:border-slate-500 transition-colors"
          >
            <span>{cat}</span>
            <button
              onClick={() =>
                onFilterChange({
                  categories: filterState.categories.filter((c) => c !== cat),
                })
              }
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Brands */}
        {filterState.brands.map((brand) => (
          <span
            key={brand}
            className="inline-flex items-center gap-1 text-xs font-mono bg-[#171D2B] text-slate-200 border border-[#1E2638] px-2 py-0.5 rounded-md hover:border-slate-500 transition-colors"
          >
            <span>Brand: {brand}</span>
            <button
              onClick={() =>
                onFilterChange({
                  brands: filterState.brands.filter((b) => b !== brand),
                })
              }
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Price bounds */}
        {(filterState.priceRangeCents[0] > 5000 || filterState.priceRangeCents[1] < 450000) && (
          <span className="inline-flex items-center gap-1 text-xs font-mono bg-[#171D2B] text-slate-200 border border-[#1E2638] px-2 py-0.5 rounded-md">
            <span>
              ${Math.round(filterState.priceRangeCents[0] / 100)} - ${Math.round(filterState.priceRangeCents[1] / 100)}
            </span>
            <button
              onClick={() => onFilterChange({ priceRangeCents: [5000, 450000] })}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Min rating */}
        {filterState.minRating > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-mono bg-[#171D2B] text-slate-200 border border-[#1E2638] px-2 py-0.5 rounded-md">
            <span>★ {filterState.minRating}+</span>
            <button
              onClick={() => onFilterChange({ minRating: 0 })}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* In Stock Only */}
        {filterState.inStockOnly && (
          <span className="inline-flex items-center gap-1 text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-md">
            <span>🟢 In Stock Only</span>
            <button
              onClick={() => onFilterChange({ inStockOnly: false })}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Historical Lows */}
        {filterState.historicalLowOnly && (
          <span className="inline-flex items-center gap-1 text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-md">
            <span>🏷️ Historical Lows</span>
            <button
              onClick={() => onFilterChange({ historicalLowOnly: false })}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Spec filters */}
        {Object.entries(filterState.specFilters).map(([k, vals]) =>
          vals.map((v, i) => (
            <span
              key={`${k}-${i}`}
              className="inline-flex items-center gap-1 text-xs font-mono bg-[#171D2B] text-slate-200 border border-[#1E2638] px-2 py-0.5 rounded-md"
            >
              <span>
                {k}: {String(v)}
              </span>
              <button
                onClick={() => {
                  const updated = { ...filterState.specFilters };
                  delete updated[k];
                  onFilterChange({ specFilters: updated });
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}

        {/* Reset All Trigger */}
        {hasActiveFilters && (
          <button
            onClick={onResetAll}
            className="inline-flex items-center gap-1 text-xs font-mono text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded-md hover:bg-rose-950/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        )}
      </div>

      {/* Save Preset & Share Shortlist Actions */}
      <div className="flex items-center gap-2">
        {/* Save Preset */}
        <div className="relative">
          {isSavingPreset ? (
            <form onSubmit={handleSavePreset} className="flex items-center gap-1.5 animate-fade-in">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset title..."
                autoFocus
                className="bg-[#171D2B] border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none w-36 font-sans"
              />
              <button
                type="submit"
                className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 text-xs"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsSavingPreset(false)}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSavingPreset(true)}
              className="text-xs font-mono text-slate-300 hover:text-white px-2.5 py-1 rounded bg-[#171D2B] hover:bg-[#20283A] border border-[#1E2638] flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3 h-3 text-cyan-400" />
              <span>{presetSavedFeedback ? 'Preset Saved!' : 'Save Preset'}</span>
            </button>
          )}
        </div>

        {/* Share Shortlist Snapshot */}
        <button
          onClick={() => setShortlistModalOpen(true)}
          className="text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded shadow-[0_0_12px_rgba(99,102,241,0.3)] flex items-center gap-1.5 font-medium transition-all"
        >
          <Share2 className="w-3 h-3" />
          <span>Share Shortlist Link</span>
        </button>
      </div>
    </div>
  );
};
