import React from 'react';
import { GameStatus } from '../types';

interface HeaderProps {
  status: GameStatus;
  isMuted: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onOpenLeaderboard: () => void;
  onOpenMatrixSelect: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isMuted,
  onToggleSound,
  onTogglePause,
  onOpenLeaderboard,
  onOpenMatrixSelect,
  onOpenSettings
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] border-b border-outline-variant/20">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
        {/* LOGO & PROTOCOL TAGLINE */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shadow-[0_0_14px_rgba(192,193,255,0.4)] border border-primary/20">
            <span className="material-symbols-outlined text-[22px]">memory</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-base tracking-wider uppercase text-on-surface font-bold">
              Kinetic Memory
            </span>
            <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-semibold">
              Time-Attack Protocol
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1.5 bg-surface-container-lowest/60 p-1 rounded-xl border border-outline-variant/30">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg text-xs font-headline font-bold transition-colors bg-surface-container-high text-primary shadow-sm"
          >
            Arena
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="px-3.5 py-1.5 rounded-lg text-xs font-headline text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Leaderboards
          </button>
          <button
            type="button"
            onClick={onOpenMatrixSelect}
            className="px-3.5 py-1.5 rounded-lg text-xs font-headline text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Matrix Select
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="px-3.5 py-1.5 rounded-lg text-xs font-headline text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Telemetry
          </button>
        </nav>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors border border-outline-variant/30 ${
              isMuted ? 'text-outline' : 'text-primary'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Pause / Resume */}
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={status === 'paused' ? 'Resume Game' : 'Pause Game'}
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/30"
            title={status === 'paused' ? 'Resume' : 'Pause'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {status === 'paused' ? 'play_arrow' : 'pause'}
            </span>
          </button>

          {/* Settings / Tune */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/30"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>

          {/* User / Agent Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-1 shadow-[0_0_10px_rgba(192,193,255,0.4)]"
            title="Neural Operative"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
