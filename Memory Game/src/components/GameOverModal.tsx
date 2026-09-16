import React from 'react';
import { DifficultyConfig, GameStats } from '../types';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  config: DifficultyConfig;
  onRestart: () => void;
  onOpenMatrixSelect: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  config,
  onRestart,
  onOpenMatrixSelect,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
      className="fixed inset-0 z-50 bg-surface-container-lowest/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col items-center text-center border border-error/30">
        {/* Close button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors p-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Pulsing Alarm Icon */}
        <div className="w-20 h-20 rounded-2xl bg-error-container/40 flex items-center justify-center text-error shadow-[0_0_32px_rgba(147,0,10,0.5)] mb-4 border border-error/40 animate-pulse">
          <span className="material-symbols-outlined text-5xl">hourglass_disabled</span>
        </div>

        <span className="font-mono text-xs uppercase tracking-widest text-error font-bold">
          Chrono-Buffer Depleted
        </span>
        <h2 id="gameover-title" className="font-headline text-2xl md:text-3xl font-bold text-on-surface mt-1">
          Time-Attack Expired
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm mt-1.5">
          Neural feedback window closed before matrix synchronization was achieved.
        </p>

        {/* Stats Bento */}
        <div className="grid grid-cols-3 gap-2.5 w-full my-6">
          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              Pairs Cleared
            </span>
            <span className="font-headline text-lg font-mono text-secondary font-bold mt-1">
              {stats.pairsCleared} / {config.totalPairs}
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              Accuracy
            </span>
            <span className="font-headline text-lg font-mono text-tertiary font-bold mt-1">
              {stats.accuracy}%
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              Total Score
            </span>
            <span className="font-headline text-lg font-mono text-primary font-bold mt-1">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-headline text-xs md:text-sm font-bold shadow-[0_4px_0_#494bd6] hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">replay</span>
            <span>Re-engage Protocol</span>
          </button>

          <button
            type="button"
            onClick={onOpenMatrixSelect}
            className="py-3 px-5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline text-xs md:text-sm font-semibold transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Change Difficulty</span>
          </button>
        </div>
      </div>
    </div>
  );
};
