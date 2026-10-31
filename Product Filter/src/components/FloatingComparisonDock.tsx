import React from 'react';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { X, ArrowRight, Layers, Trash2 } from 'lucide-react';

export const FloatingComparisonDock: React.FC = () => {
  const { comparisonItems, removeComparisonItem, clearComparison, setComparisonModalOpen } = useDiscoveryStore();

  if (comparisonItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="glass-dock rounded-2xl p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 sm:gap-6 shadow-glass-dock border border-white/15">
        {/* Comparison slots */}
        <div className="flex items-center gap-2">
          {comparisonItems.map((item) => (
            <div
              key={item.id}
              className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#080A0F] border border-indigo-500/50 p-1 flex items-center justify-center overflow-hidden shadow-md"
            >
              <img
                src={item.variants[0]?.imageUrl || item.studioAngles?.[0]}
                alt={item.title}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => removeComparisonItem(item.id)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from comparison"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Empty slot indicators up to 4 */}
          {Array.from({ length: 4 - comparisonItems.length }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-dashed border-slate-700 bg-[#080A0F]/30 flex flex-col items-center justify-center text-slate-600"
            >
              <span className="text-[10px] font-mono">+{i + 1 + comparisonItems.length}</span>
            </div>
          ))}
        </div>

        {/* Info & Triggers */}
        <div className="flex items-center gap-3 border-l border-[#1E2638] pl-3 sm:pl-5">
          <div className="hidden sm:block">
            <div className="text-xs font-mono font-semibold text-white">
              {comparisonItems.length} of 4 Selected
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Side-by-side spec matrix
            </div>
          </div>

          <button
            onClick={clearComparison}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear all comparison items"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setComparisonModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-semibold text-xs font-mono px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Compare Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
