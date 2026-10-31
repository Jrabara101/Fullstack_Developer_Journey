import React from 'react';
import { FilterQueryState } from '../types';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

interface NearMissRecoveryBannerProps {
  suggestions?: {
    description: string;
    relaxedFilterPatch: Partial<FilterQueryState>;
    unlockedCount: number;
  }[];
  onApplyPatch: (patch: Partial<FilterQueryState>) => void;
  totalMatched: number;
}

export const NearMissRecoveryBanner: React.FC<NearMissRecoveryBannerProps> = ({
  suggestions,
  onApplyPatch,
  totalMatched,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-amber-950/40 via-[#171D2B] to-[#0F131D] border border-amber-500/40 rounded-xl p-3.5 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-amber-300 uppercase tracking-wide">
                Elastic Near-Miss Discovery
              </span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-200 px-1.5 py-0.2 rounded border border-amber-800/40">
                {totalMatched === 0 ? 'Zero Dead-End Recovery' : 'Relaxation Suggestions'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-sans">
              Your criteria are slightly too restrictive. These single-click adjustments instantly unlock top-ranked products:
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => onApplyPatch(sug.relaxedFilterPatch)}
              className="text-xs font-mono bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{sug.description}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
