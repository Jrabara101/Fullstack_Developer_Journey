import React, { useState } from 'react';
import { Difficulty, TimerMode } from '../types';
import { DIFFICULTY_CONFIGS } from '../utils/cardDeck';

interface MatrixSelectModalProps {
  isOpen: boolean;
  currentDifficulty: Difficulty;
  currentTimerMode: TimerMode;
  onClose: () => void;
  onApply: (difficulty: Difficulty, timerMode: TimerMode) => void;
}

export const MatrixSelectModal: React.FC<MatrixSelectModalProps> = ({
  isOpen,
  currentDifficulty,
  currentTimerMode,
  onClose,
  onApply
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);
  const [selectedTimerMode, setSelectedTimerMode] = useState<TimerMode>(currentTimerMode);

  if (!isOpen) return null;

  const handleSave = () => {
    onApply(selectedDifficulty, selectedTimerMode);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="matrix-title"
      className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-surface-container p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col border border-outline-variant/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
            <div>
              <h2 id="matrix-title" className="font-headline text-xl font-bold text-on-surface">
                Matrix Configuration
              </h2>
              <span className="font-mono text-[11px] text-outline">
                Difficulty Scaling & Cognitive Mode
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-outline hover:text-on-surface transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* SECTION 1: DIFFICULTY TIER */}
        <div className="my-5">
          <label className="font-mono text-xs uppercase tracking-wider text-outline mb-2.5 block font-semibold">
            Difficulty Tier & Working Memory Load
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(tier => {
              const cfg = DIFFICULTY_CONFIGS[tier];
              const isSelected = selectedDifficulty === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedDifficulty(tier)}
                  className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-surface-container-high border-primary shadow-[0_0_16px_rgba(192,193,255,0.3)] ring-1 ring-primary'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container-high/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-secondary">
                        {cfg.gridCols} × {cfg.gridRows}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-xs text-primary font-bold">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="font-headline text-sm font-bold text-on-surface mt-1">
                      {tier === 'easy' ? 'Warmup' : tier === 'medium' ? 'Core' : 'Expert Hard'}
                    </div>
                    <p className="text-[11px] text-outline mt-1 leading-snug">
                      {cfg.totalPairs} Pairs ({cfg.totalCards} cards)
                    </p>
                  </div>
                  <span className="font-mono text-[9px] text-primary-fixed-dim mt-2 block">
                    {tier === 'hard' ? '⚠️ -2s error penalty' : 'Distinct silhouettes'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: TIMER ENGINE */}
        <div className="mb-6">
          <label className="font-mono text-xs uppercase tracking-wider text-outline mb-2.5 block font-semibold">
            Timer Psychology & Stress Dynamics
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Burn-Down (Countdown) */}
            <button
              type="button"
              onClick={() => setSelectedTimerMode('countdown')}
              className={`p-3.5 rounded-xl text-left transition-all border ${
                selectedTimerMode === 'countdown'
                  ? 'bg-surface-container-high border-tertiary shadow-[0_0_16px_rgba(255,185,95,0.25)] ring-1 ring-tertiary'
                  : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container-high/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-tertiary">
                  <span className="material-symbols-outlined text-lg">timer</span>
                  <span className="font-headline text-xs font-bold uppercase tracking-wider">
                    Burn-Down (Time-Attack)
                  </span>
                </div>
                {selectedTimerMode === 'countdown' && (
                  <span className="material-symbols-outlined text-xs text-tertiary font-bold">
                    check_circle
                  </span>
                )}
              </div>
              <p className="text-[11px] text-outline mt-1.5 leading-snug">
                Survival stress. Dynamic urgency bar pulsing red in final 10s. Earn +3s bonus per match.
              </p>
            </button>

            {/* Count-Up (Stopwatch) */}
            <button
              type="button"
              onClick={() => setSelectedTimerMode('stopwatch')}
              className={`p-3.5 rounded-xl text-left transition-all border ${
                selectedTimerMode === 'stopwatch'
                  ? 'bg-surface-container-high border-secondary shadow-[0_0_16px_rgba(78,222,163,0.25)] ring-1 ring-secondary'
                  : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container-high/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-lg">hourglass_top</span>
                  <span className="font-headline text-xs font-bold uppercase tracking-wider">
                    Count-Up (Zen Mastery)
                  </span>
                </div>
                {selectedTimerMode === 'stopwatch' && (
                  <span className="material-symbols-outlined text-xs text-secondary font-bold">
                    check_circle
                  </span>
                )}
              </div>
              <p className="text-[11px] text-outline mt-1.5 leading-snug">
                Compete against your own best time without time limits. Focus on pure move efficiency.
              </p>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-headline font-semibold text-outline hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-headline text-xs font-bold shadow-[0_4px_0_#494bd6] hover:translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">play_arrow</span>
            <span>Initiate Matrix</span>
          </button>
        </div>
      </div>
    </div>
  );
};
