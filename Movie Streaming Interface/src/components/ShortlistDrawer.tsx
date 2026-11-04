import React from 'react';
import { 
  X, 
  Trash2, 
  Play, 
  Clock, 
  Bookmark, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { MediaItem } from '../types';
import { calculateShortlistQueueTime, calculateFinishTime } from '../services/finishByCalculator';

interface ShortlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shortlistItems: MediaItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onPlay: (item: MediaItem) => void;
  referenceTime: Date;
}

export const ShortlistDrawer: React.FC<ShortlistDrawerProps> = ({
  isOpen,
  onClose,
  shortlistItems,
  onRemoveItem,
  onClearAll,
  onPlay,
  referenceTime
}) => {
  if (!isOpen) return null;

  const queueDurations = shortlistItems.map(item => item.durationMinutes);
  const queueStats = calculateShortlistQueueTime(queueDurations, referenceTime);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#121418] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/20 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24]">
                <Bookmark className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Tonight's Shortlist
                </h3>
                <span className="text-xs text-white/50">
                  {shortlistItems.length} {shortlistItems.length === 1 ? 'title' : 'titles'} queued
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Queue Aggregate Calculation Banner */}
          {shortlistItems.length > 0 && (
            <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#FBBF24]/10 via-[#FBBF24]/5 to-transparent border border-[#FBBF24]/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FBBF24] mb-1">
                <Clock className="w-4 h-4" />
                <span>Binge Completion Forecast</span>
              </div>
              <div className="text-sm font-extrabold text-white font-mono-numbers">
                {queueStats.totalDurationFormatted} total • Finish by {queueStats.finishTimeFormatted}
              </div>
              <p className="text-[11px] text-white/60 mt-0.5">
                Calculated dynamically from your active clock
              </p>
            </div>
          )}

          {/* Queued Items List */}
          <div className="space-y-3 mt-4 max-h-[50vh] overflow-y-auto pr-1">
            {shortlistItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/30">
                  <Bookmark className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-white/60">
                  Your queue for tonight is empty
                </p>
                <p className="text-xs text-white/40 max-w-[240px] mx-auto">
                  Click the "+ Tonight's Shortlist" button on any movie card to line up your evening.
                </p>
              </div>
            ) : (
              shortlistItems.map((item, idx) => {
                const finishInfo = calculateFinishTime(item.durationMinutes, 0, referenceTime);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#181A20] border border-white/5 hover:border-white/15 flex items-center gap-3 transition-all group"
                  >
                    <span className="text-xs font-mono font-bold text-white/40 w-4">
                      {idx + 1}
                    </span>

                    <img
                      src={item.backdropUrl}
                      alt={item.title}
                      className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono-numbers">
                        <span>{finishInfo.durationFormatted}</span>
                        <span>•</span>
                        <span className="text-[#34D399] font-sans font-semibold">
                          {item.matchScores.alex || 95}% Match
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          onPlay(item);
                          onClose();
                        }}
                        className="w-7 h-7 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center transition-transform hover:scale-110"
                        title="Play"
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </button>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 flex items-center justify-center transition-colors"
                        title="Remove from shortlist"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {shortlistItems.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                if (shortlistItems.length > 0) {
                  onPlay(shortlistItems[0]);
                  onClose();
                }
              }}
              className="w-full py-3 rounded-xl bg-white hover:bg-white/90 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-102 active:scale-98 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Marathon (Play First)</span>
            </button>

            <button
              onClick={onClearAll}
              className="w-full py-2 rounded-xl text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              Clear Entire Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

