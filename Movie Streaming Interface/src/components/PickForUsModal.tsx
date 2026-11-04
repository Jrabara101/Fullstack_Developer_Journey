import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Trophy, 
  Play, 
  Bookmark, 
  RotateCcw, 
  ThumbsDown, 
  Clock, 
  Flame, 
  Check,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaItem } from '../types';
import { calculateFinishTime } from '../services/finishByCalculator';

interface PickForUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onToggleShortlist: (item: MediaItem) => void;
  shortlistIds: string[];
  referenceTime: Date;
}

export const PickForUsModal: React.FC<PickForUsModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onPlay,
  onToggleShortlist,
  shortlistIds,
  referenceTime
}) => {
  const [candidates, setCandidates] = useState<MediaItem[]>([]);
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const [winner, setWinner] = useState<MediaItem | null>(null);

  // Initialize 3 diverse candidates whenever modal opens
  const resetShowdown = () => {
    // Pick 3 diverse titles from catalog (different moods)
    const shuffled = [...catalog].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setCandidates(selected);
    setEliminatedIds([]);
    setWinner(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetShowdown();
    }
  }, [isOpen]);

  const eliminateCard = (id: string) => {
    const updatedEliminated = [...eliminatedIds, id];
    setEliminatedIds(updatedEliminated);

    const remaining = candidates.filter(c => !updatedEliminated.includes(c.id));
    if (remaining.length === 1) {
      const winningTitle = remaining[0];
      setWinner(winningTitle);
      // Trigger festive confetti celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E50914', '#FBBF24', '#34D399', '#38BDF8', '#FFFFFF']
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#121418] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/20 border border-[#E50914]/30 text-[#E50914] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Anti-Decision Fatigue Engine</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {winner ? 'We Have a Winner!' : 'The 3-Card Showdown'}
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            {winner
              ? 'Decision fatigue eliminated. No more endless scrolling—grab your snacks and hit play!'
              : 'Don’t browse 200 titles. Knock out 2 contenders and start watching the ultimate winner.'}
          </p>
        </div>

        {/* WINNER STATE */}
        {winner ? (
          <div className="max-w-xl mx-auto rounded-2xl bg-[#1F222A] border-2 border-[#34D399] p-6 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399] mx-auto mb-4">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-4 shadow-xl">
              <img
                src={winner.backdropUrl}
                alt={winner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute bottom-3 left-4 right-4 text-left">
                <span className="text-[#34D399] text-xs font-bold uppercase tracking-wider">
                  {winner.matchScores.alex || 96}% MATCH
                </span>
                <h3 className="font-display font-extrabold text-xl text-white">
                  {winner.title}
                </h3>
              </div>
            </div>

            <p className="text-sm font-semibold text-white/90 italic mb-2">
              "{winner.editorialHook}"
            </p>
            <p className="text-xs text-white/60 mb-6 line-clamp-2">
              {winner.synopsis}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onPlay(winner);
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Watching Now</span>
              </button>

              <button
                onClick={() => onToggleShortlist(winner)}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  shortlistIds.includes(winner.id)
                    ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]'
                    : 'glass-pill text-white hover:bg-white/20'
                }`}
              >
                {shortlistIds.includes(winner.id) ? (
                  <>
                    <Check className="w-4 h-4 text-[#34D399]" />
                    <span>In Queue</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save to Tonight</span>
                  </>
                )}
              </button>

              <button
                onClick={resetShowdown}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reroll Cards</span>
              </button>
            </div>
          </div>
        ) : (
          /* SHOWDOWN 3-CARD DECK */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {candidates.map((card, idx) => {
              const isEliminated = eliminatedIds.includes(card.id);
              const finishInfo = calculateFinishTime(card.durationMinutes, 0, referenceTime);

              return (
                <div
                  key={card.id}
                  className={`relative rounded-2xl bg-[#181A20] border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    isEliminated
                      ? 'opacity-25 grayscale scale-95 border-red-500/20 pointer-events-none'
                      : 'border-white/10 hover:border-white/30 shadow-2xl hover:-translate-y-1'
                  }`}
                >
                  {/* Card Artwork */}
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                      <img
                        src={card.backdropUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181A20] via-transparent to-black/60" />
                      
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                          Candidate #{idx + 1}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-3 right-3">
                        <h4 className="font-display font-extrabold text-base text-white truncate">
                          {card.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#34D399] font-bold">
                          <span>{card.matchScores.alex || 94}% Match</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/70 font-mono-numbers">
                            {finishInfo.durationFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pitch & Tags */}
                    <div className="p-4 space-y-2.5">
                      <p className="text-xs font-semibold text-white/90 leading-snug">
                        "{card.editorialHook}"
                      </p>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[11px] text-[#FBBF24] font-mono-numbers">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>Finish by {finishInfo.finishTimeFormatted}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-medium flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5 text-[#34D399]" />
                          {card.cognitiveLoad}
                        </span>
                        {card.pacingTags.slice(0, 1).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Elimination Action Button */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => eliminateCard(card.id)}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Not Feeling This One (Eliminate)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer helper */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>Tip: Trust your gut. Studies show 90% of streaming regret comes from scrolling too long.</span>
          {!winner && (
            <button
              onClick={resetShowdown}
              className="text-[#FBBF24] hover:underline font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Draw 3 New Cards</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

