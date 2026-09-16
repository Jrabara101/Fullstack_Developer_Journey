import React from 'react';
import { DifficultyConfig, GameStats, TimerMode } from '../types';

interface GameHudProps {
  config: DifficultyConfig;
  stats: GameStats;
  timerMode: TimerMode;
  onOpenMatrixSelect: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  config,
  stats,
  timerMode,
  onOpenMatrixSelect
}) => {
  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isUrgent = timerMode === 'countdown' && stats.timeRemaining <= 10;
  const isWarning = timerMode === 'countdown' && stats.timeRemaining <= 20 && stats.timeRemaining > 10;

  // Percentage for countdown fill bar
  const countdownPercentage = timerMode === 'countdown'
    ? Math.max(0, Math.min(100, (stats.timeRemaining / config.countdownSeconds) * 100))
    : 100;

  return (
    <header className="relative z-20 w-full max-w-6xl mx-auto bg-surface-container/85 backdrop-blur-xl rounded-2xl p-4 lg:px-8 shadow-[0_16px_36px_rgba(0,0,0,0.55)] border border-outline-variant/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LEFT: Phase / Level Telemetry & Moves */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <button
            type="button"
            onClick={onOpenMatrixSelect}
            className="group flex items-center gap-2.5 bg-surface-container-high hover:bg-surface-bright px-3.5 py-1.5 rounded-full shadow-inner border border-outline-variant/40 transition-all"
            title="Click to change matrix difficulty"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.9)] animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="font-mono text-[10px] tracking-wider uppercase text-secondary font-bold flex items-center gap-1">
                {config.label}
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
                  expand_more
                </span>
              </span>
              <span className="font-headline text-xs font-semibold text-on-surface">
                {config.subtitle}
              </span>
            </div>
          </button>

          <div className="flex flex-col items-end md:items-start pl-2">
            <span className="font-mono text-[10px] text-outline uppercase tracking-widest">
              Turn Count
            </span>
            <span className="font-headline text-lg text-on-surface font-mono font-bold" id="turnCounter">
              {stats.moves} {stats.moves === 1 ? 'Move' : 'Moves'}
            </span>
          </div>
        </div>

        {/* CENTER: Attack Timer Pod (Burn-down vs Count-up) */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-2">
            <span
              className={`material-symbols-outlined text-lg ${
                isUrgent
                  ? 'text-error animate-ping'
                  : isWarning
                  ? 'text-tertiary-fixed animate-bounce'
                  : 'text-tertiary-fixed-dim'
              }`}
            >
              {timerMode === 'countdown' ? 'timer' : 'hourglass_top'}
            </span>
            <span
              className={`font-headline text-3xl sm:text-4xl tracking-tight font-mono font-bold transition-colors ${
                isUrgent
                  ? 'text-error drop-shadow-[0_0_20px_rgba(255,180,171,0.8)] animate-pulse'
                  : isWarning
                  ? 'text-tertiary drop-shadow-[0_0_18px_rgba(255,185,95,0.6)]'
                  : 'text-tertiary-fixed-dim drop-shadow-[0_0_18px_rgba(255,185,95,0.45)]'
              }`}
              id="countdownDisplay"
            >
              {timerMode === 'countdown'
                ? formatTime(stats.timeRemaining)
                : formatTime(stats.timeElapsed)}
            </span>
          </div>

          {/* Dynamic Progress / Tension Bar */}
          {timerMode === 'countdown' ? (
            <div className="w-56 sm:w-72 md:w-80 h-2 bg-surface-container-lowest rounded-full overflow-hidden p-0.5 shadow-inner mt-1 border border-outline-variant/20">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(192,193,255,0.6)] ${
                  isUrgent
                    ? 'bg-error shadow-[0_0_14px_rgba(255,180,171,0.9)] animate-pulse'
                    : isWarning
                    ? 'bg-gradient-to-r from-error via-tertiary to-secondary'
                    : 'bg-gradient-to-r from-tertiary via-primary to-secondary'
                }`}
                style={{ width: `${countdownPercentage}%` }}
              />
            </div>
          ) : (
            <div className="w-56 sm:w-72 md:w-80 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden mt-1">
              <div className="h-full bg-secondary/80 w-full animate-pulse-slow rounded-full shadow-[0_0_8px_rgba(78,222,163,0.5)]" />
            </div>
          )}

          {/* Status Label */}
          <span className="font-mono text-[10px] uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                isUrgent ? 'bg-error animate-ping' : 'bg-secondary animate-pulse'
              }`}
            />
            <span className={isUrgent ? 'text-error font-bold tracking-widest' : 'text-outline'}>
              {timerMode === 'countdown'
                ? isUrgent
                  ? 'CRITICAL BUFFER • TIME DEPLETION'
                  : 'Time-Attack Window Active'
                : 'Zen Mastery Stopwatch Active'}
            </span>
          </span>
        </div>

        {/* RIGHT: Multiplier & Score */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Combo Multiplier Pill */}
          <div className="bg-surface-container-highest/70 px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-tertiary/20 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-tertiary-container/40 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-base">local_fire_department</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-tertiary-fixed-dim uppercase tracking-wider">
                Combo Boost
              </span>
              <span className="font-headline text-xs font-bold text-tertiary tracking-tight">
                x{stats.combo} Streak
              </span>
            </div>
          </div>

          {/* Yield Score */}
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-outline uppercase tracking-widest">
              Yield Score
            </span>
            <span className="font-headline text-lg text-primary tracking-tight drop-shadow-[0_0_12px_rgba(192,193,255,0.4)] font-mono font-bold">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
