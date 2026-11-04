import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  X,
  Bookmark,
  Check
} from 'lucide-react';
import { MediaItem } from '../types';
import { getSpoilerLockedRecap } from '../services/spoilerService';
import { calculateFinishTime } from '../services/finishByCalculator';

interface ContinueWatchingRowProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onToggleShortlist: (item: MediaItem) => void;
  shortlistIds: string[];
  referenceTime: Date;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  items,
  onPlay,
  onOpenDetails,
  onToggleShortlist,
  shortlistIds,
  referenceTime
}) => {
  const [activeRecapId, setActiveRecapId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="relative my-10 max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
              Where You Left Off
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E50914]/20 text-[#E50914] font-semibold">
                Spoiler-Protected
              </span>
            </h2>
            <p className="text-xs text-white/50">
              Pick up seamlessly without losing the plot: 15-second recaps locked strictly to your paused minute.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Continue Watching Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((item) => {
          const progress = item.progress!;
          const recap = getSpoilerLockedRecap(item);
          const isRecapOpen = activeRecapId === item.id;
          const finishInfo = calculateFinishTime(
            item.durationMinutes,
            progress.progressSeconds,
            referenceTime
          );

          const progressPercent = Math.min(
            100,
            Math.round((progress.progressSeconds / (item.durationMinutes * 60)) * 100)
          );

          const isInShortlist = shortlistIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="relative rounded-2xl bg-[#181A20] border border-white/10 overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col"
            >
              {/* Top Media Bar */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black group">
                <img
                  src={item.backdropUrl}
                  alt={item.title}
                  className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181A20] via-black/30 to-black/60" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
                    {progress.currentEpisode || 'Feature Film'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#E50914] text-white text-[11px] font-bold font-mono-numbers shadow-lg flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {finishInfo.remainingFormatted}
                  </span>
                </div>

                {/* Center Quick Resume Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                  <button
                    onClick={() => onPlay(item)}
                    className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume at {Math.floor(progress.progressSeconds / 60)}m</span>
                  </button>
                </div>

                {/* Bottom Left Title info */}
                <div className="absolute bottom-2 left-3 right-3 z-10">
                  <h3 className="font-display font-extrabold text-base text-white truncate drop-shadow-md">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-white/70">
                    <span>Paused {progress.lastWatchedDaysAgo} days ago</span>
                    <span>•</span>
                    <span className="text-[#FBBF24] font-mono-numbers">
                      Finish by {finishInfo.finishTimeFormatted}
                    </span>
                  </div>
                </div>

                {/* Bottom Progress Bar (3px crimson) */}
                <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/20">
                  <div
                    className="h-full bg-[#E50914] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 flex items-center justify-between gap-2 bg-[#181A20] border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPlay(item)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-105"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </button>

                  <button
                    onClick={() => onToggleShortlist(item)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                      isInShortlist
                        ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    }`}
                    title="Tonight's Queue"
                  >
                    {isInShortlist ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                  </button>
                </div>

                {/* "Catch Me Up" 15-Sec Recap Drawer Trigger */}
                {recap && (
                  <button
                    onClick={() => setActiveRecapId(isRecapOpen ? null : item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isRecapOpen
                        ? 'bg-[#FBBF24] text-black shadow-lg shadow-[#FBBF24]/20'
                        : 'bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 text-[#FBBF24] border border-[#FBBF24]/30'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{isRecapOpen ? 'Hide Recap' : '15-Sec Story Recap'}</span>
                  </button>
                )}
              </div>

              {/* Expandable "Catch Me Up" Spoiler-Safe Memory Refresher Drawer */}
              {isRecapOpen && recap && (
                <div className="p-4 bg-[#121418] border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                      <span>Memory Refresher up to {recap.spoilerSafeLockTimestamp}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30">
                      0 Spoilers Ahead
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-white/60 mb-2 italic">
                    {recap.activeActName}:
                  </p>

                  <ul className="space-y-2 mb-3">
                    {recap.recapBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-white/90 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] mt-1.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-white/40">
                      Future twists locked beyond minute {recap.pausedMinute}
                    </span>
                    <button
                      onClick={() => onPlay(item)}
                      className="text-xs text-[#34D399] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Jump in now</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

