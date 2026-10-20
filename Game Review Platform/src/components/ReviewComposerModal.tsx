import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { submitReview } from '../lib/api';
import { HalfStarScrubber } from './HalfStarScrubber';
import { GameCatalogItem, ShelfStatus } from '../types';
import { X, ShieldAlert, Sparkles, Send, Check } from 'lucide-react';

interface ReviewComposerModalProps {
  games: GameCatalogItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewComposerModal: React.FC<ReviewComposerModalProps> = ({
  games,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { reviewDraft, updateReviewDraft, activeUserId } = useAppStore();
  const [selectedGameId, setSelectedGameId] = useState<string>(reviewDraft.gameId || games[0]?.id || 'elden-ring');

  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0];

  const mutation = useMutation({
    mutationFn: (data: any) => submitReview(selectedGameId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', selectedGameId] });
      queryClient.invalidateQueries({ queryKey: ['game', selectedGameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['user', activeUserId] });
      onClose();
    },
  });

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePillarChange = (key: keyof typeof reviewDraft.pillars, val: number) => {
    updateReviewDraft({
      pillars: {
        ...reviewDraft.pillars,
        [key]: Math.round(val * 10) / 10,
      },
    });
  };

  const handleInsertSpoilerTag = () => {
    const textarea = document.getElementById('review-prose-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = reviewDraft.bodyMarkdown;
    const selected = text.substring(start, end);
    const replacement = selected ? `>!${selected}!<` : `>!Write spoiler text here!<`;

    const nextText = text.substring(0, start) + replacement + text.substring(end);
    updateReviewDraft({ bodyMarkdown: nextText });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      gameId: selectedGameId,
      starRating: reviewDraft.starRating,
      isMasterpiece: reviewDraft.isMasterpiece,
      pillars: reviewDraft.pillars,
      completionStatus: reviewDraft.completionStatus,
      playtimeHours: Number(reviewDraft.playtimeHours),
      platformPlayed: reviewDraft.platformPlayed,
      patchVersion: reviewDraft.patchVersion,
      bodyMarkdown: reviewDraft.bodyMarkdown || 'A context-verified critique.',
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-[#0D111C] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#10141F]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-white text-base tracking-wide">
              Publish Context-Verified Review
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Game Selection */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Select Game
            </label>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="w-full bg-[#151B2B] border border-slate-700 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:border-cyan-500"
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.releaseYear}) • {g.developer}
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating Scrubber + Masterpiece Crown */}
          <div className="bg-[#151B2B]/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Overall Score & Masterpiece Anointment
            </label>
            <HalfStarScrubber
              value={reviewDraft.starRating}
              onChange={(val) => updateReviewDraft({ starRating: val })}
              isMasterpiece={reviewDraft.isMasterpiece}
              onMasterpieceToggle={(val) => updateReviewDraft({ isMasterpiece: val })}
              size="lg"
            />
          </div>

          {/* 5-Pillar Attribute Sliders */}
          <div className="bg-[#151B2B]/60 border border-slate-800/80 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                5-Pillar Radar Breakdown (1.0 - 5.0)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Powers community taste vectors
              </span>
            </div>

            {(['gameplay', 'narrative', 'visuals', 'audio', 'polish'] as const).map((pillarKey) => {
              const currentVal = reviewDraft.pillars[pillarKey];
              return (
                <div key={pillarKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-mono text-slate-300 font-medium">
                      {pillarKey}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {currentVal.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={currentVal}
                    onChange={(e) => handlePillarChange(pillarKey, parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          {/* Telemetry Row: Status, Hours, Platform, Patch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Completion State
              </label>
              <select
                value={reviewDraft.completionStatus}
                onChange={(e) => updateReviewDraft({ completionStatus: e.target.value as ShelfStatus })}
                className="w-full bg-[#151B2B] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:border-cyan-500 font-medium"
              >
                <option value="BEATEN">Story Beaten</option>
                <option value="MASTERED_100">100% Mastered</option>
                <option value="PLAYING">Still Playing</option>
                <option value="DROPPED">Dropped / Shelved</option>
                <option value="BACKLOG">Backlog</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Playtime Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={reviewDraft.playtimeHours}
                onChange={(e) => updateReviewDraft({ playtimeHours: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#151B2B] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Platform Tested
              </label>
              <select
                value={reviewDraft.platformPlayed}
                onChange={(e) => updateReviewDraft({ platformPlayed: e.target.value })}
                className="w-full bg-[#151B2B] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:border-cyan-500 font-medium"
              >
                <option value="PC">PC</option>
                <option value="PS5">PlayStation 5</option>
                <option value="XBOX">Xbox Series X</option>
                <option value="SWITCH">Nintendo Switch</option>
                <option value="DECK">Steam Deck</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Patch Version
              </label>
              <input
                type="text"
                value={reviewDraft.patchVersion}
                onChange={(e) => updateReviewDraft({ patchVersion: e.target.value })}
                className="w-full bg-[#151B2B] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:border-cyan-500 font-mono"
                placeholder="v1.08"
              />
            </div>
          </div>

          {/* Markdown Review Prose + Spoiler Tag Tool */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Critical Essay & Analysis (Markdown)
              </label>
              <button
                type="button"
                onClick={handleInsertSpoilerTag}
                className="flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded transition-colors"
                title="Wraps selection in >!spoiler!< tags"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>+ Spoiler Tag</span>
              </button>
            </div>

            <textarea
              id="review-prose-textarea"
              rows={5}
              value={reviewDraft.bodyMarkdown}
              onChange={(e) => updateReviewDraft({ bodyMarkdown: e.target.value })}
              className="w-full bg-[#151B2B] border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              placeholder="Detail your critical impressions, mechanical feedback, and atmospheric insights... Use >!spoilers!< for plot revelations."
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider transition-all duration-150 shadow-glow-gold"
            >
              <Send className="w-4 h-4" />
              <span>{mutation.isPending ? 'Broadcasting...' : 'Broadcast Critique'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
