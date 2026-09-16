import React from 'react';
import { Difficulty, DifficultyConfig, GameStats, TimerMode } from '../types';

interface VictoryModalProps {
  isOpen: boolean;
  stats: GameStats;
  config: DifficultyConfig;
  timerMode: TimerMode;
  difficulty: Difficulty;
  onClose: () => void;
  onRestart: () => void;
  onAdvanceDifficulty: () => void;
  onOpenLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  stats,
  config,
  timerMode,
  difficulty,
  onClose,
  onRestart,
  onAdvanceDifficulty,
  onOpenLeaderboard
}) => {
  if (!isOpen) return null;

  const clearTimeSeconds = timerMode === 'countdown'
    ? config.countdownSeconds - stats.timeRemaining
    : stats.timeElapsed;

  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const nextPhaseName =
    difficulty === 'easy'
      ? 'Phase 02 (Core 6x4)'
      : difficulty === 'medium'
      ? 'Phase 03 (Hard 8x4)'
      : 'Phase 01 (Warmup 4x4)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col items-center text-center border border-outline-variant/30">
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors p-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Glowing Trophy Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tertiary-container/50 to-surface-container-highest flex items-center justify-center text-tertiary shadow-[0_0_32px_rgba(255,185,95,0.4)] mb-4 border border-tertiary/30 animate-bounce">
          <span className="material-symbols-outlined text-5xl">trophy</span>
        </div>

        <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
          Chrono-Matrix Synchronized
        </span>
        <h2 id="victory-title" className="font-headline text-2xl md:text-3xl font-bold text-on-surface mt-1">
          Speedrun Victory!
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm mt-1.5">
          Time-Attack protocol defeated with exceptional neural accuracy and streak multiplier.
        </p>

        {/* STATS BENTO BREAKDOWN */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full my-6">
          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              Clear Time
            </span>
            <span className="font-headline text-lg font-mono text-tertiary font-bold mt-1">
              {formatTime(clearTimeSeconds)}
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              Accuracy
            </span>
            <span className="font-headline text-lg font-mono text-secondary font-bold mt-1">
              {stats.accuracy}%
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              Max Combo
            </span>
            <span className="font-headline text-lg font-mono text-primary font-bold mt-1">
              x{stats.maxCombo} STK
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              Total Score
            </span>
            <span className="font-headline text-lg font-mono text-on-surface font-bold mt-1">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* MODAL ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={onAdvanceDifficulty}
            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-headline text-xs md:text-sm font-bold shadow-[0_4px_0_#494bd6] hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>Advance: {nextPhaseName}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline text-xs md:text-sm font-semibold transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">replay</span>
            <span>Replay</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline text-xs md:text-sm font-semibold transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">leaderboard</span>
            <span>Telemetry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
