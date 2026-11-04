import React from 'react';
import { Users, Sparkles, Filter, X } from 'lucide-react';
import { BlenderSynthesis } from '../services/tasteIntersectionEngine';

interface BlenderBannerProps {
  synthesis: BlenderSynthesis;
  onResetToSingle: () => void;
}

export const BlenderBanner: React.FC<BlenderBannerProps> = ({
  synthesis,
  onResetToSingle
}) => {
  if (synthesis.activeProfiles.length <= 1) return null;

  return (
    <div className="relative z-20 max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 my-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#181A20] via-[#1F222A] to-[#181A20] border border-[#34D399]/30 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399] flex-shrink-0 mt-0.5">
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-sm text-white">
                Co-Watching Mode Active: {synthesis.profileNamesFormatted}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] text-xs font-bold border border-[#34D399]/30">
                {synthesis.consensusAverage}% Avg Shared Harmony
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1 max-w-3xl leading-relaxed">
              {synthesis.synthesisNote}
            </p>
          </div>
        </div>

        {/* Right Stats & Unblend button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
          {synthesis.filteredWatchedCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Filter className="w-3.5 h-3.5 text-[#34D399]" />
              <span>{synthesis.filteredWatchedCount} watched removed</span>
            </div>
          )}

          <button
            onClick={onResetToSingle}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Co-Watch</span>
          </button>
        </div>
      </div>
    </div>
  );
};

