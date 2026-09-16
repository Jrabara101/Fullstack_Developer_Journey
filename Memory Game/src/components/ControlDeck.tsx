import React from 'react';
import { DifficultyConfig, GameStats, GameStatus } from '../types';

interface ControlDeckProps {
  stats: GameStats;
  config: DifficultyConfig;
  status: GameStatus;
  onHint: () => void;
  onReset: () => void;
  onSimulateVictory: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  stats,
  config,
  status,
  onHint,
  onReset,
  onSimulateVictory
}) => {
  return (
    <footer className="relative z-20 w-full max-w-6xl mx-auto bg-surface-container/85 backdrop-blur-xl rounded-2xl p-4 lg:px-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)] border border-outline-variant/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LIVE PRECISION STATS */}
        <div className="flex items-center gap-6 text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm">filter_vintage</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-outline">
              Pairs Cleared:
            </span>
            <span className="font-headline text-sm font-bold text-on-surface">
              {stats.pairsCleared} / {config.totalPairs}
            </span>
          </div>

          <div className="w-1 h-1 rounded-full bg-surface-variant" />

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">target</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-outline">
              Accuracy:
            </span>
            <span className="font-headline text-sm font-bold text-secondary font-mono">
              {stats.accuracy}%
            </span>
          </div>
        </div>

        {/* INTERACTIVE GAME DECK CONTROLS */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {/* Hint Button with Token Count */}
          <button
            type="button"
            disabled={stats.hintsRemaining <= 0 || status !== 'playing'}
            onClick={onHint}
            className={`group relative px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all duration-150 flex items-center gap-2 shadow-sm active:scale-95 border border-outline-variant/30 ${
              stats.hintsRemaining <= 0 || status !== 'playing'
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:border-tertiary/50'
            }`}
            title="Reveal matching pair location temporarily"
          >
            <span className="material-symbols-outlined text-tertiary group-hover:rotate-12 transition-transform text-lg">
              lightbulb
            </span>
            <span className="font-headline text-xs font-semibold">Hint</span>
            <span className="w-4 h-4 rounded-full bg-tertiary text-on-tertiary-container font-mono text-[10px] font-bold flex items-center justify-center">
              {stats.hintsRemaining}
            </span>
          </button>

          {/* Reset Protocol Trigger */}
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all duration-150 flex items-center gap-2 shadow-sm active:scale-95 border border-outline-variant/30 hover:border-primary/40"
            title="Reset active protocol"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            <span className="font-headline text-xs font-semibold">Reset</span>
          </button>

          {/* Victory Modal Showcase Trigger (from original mockup) */}
          <button
            type="button"
            onClick={onSimulateVictory}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-headline text-xs font-bold shadow-[0_4px_0_#494bd6] hover:shadow-[0_2px_0_#494bd6] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5 ml-1"
            title="Trigger victory modal preview"
          >
            <span className="material-symbols-outlined text-base">workspace_premium</span>
            <span>Simulate Victory</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
