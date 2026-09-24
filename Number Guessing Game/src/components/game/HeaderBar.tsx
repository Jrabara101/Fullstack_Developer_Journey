import { GameMode } from '../../types/game';
import { Lock, Volume2, VolumeX, BarChart3, Flame } from 'lucide-react';

interface HeaderBarProps {
  gameMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  attemptsUsed: number;
  maxAttempts: number;
  currentStreak: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenStats: () => void;
}

export function HeaderBar({
  gameMode,
  onSelectMode,
  attemptsUsed,
  maxAttempts,
  currentStreak,
  isMuted,
  onToggleMute,
  onOpenStats,
}: HeaderBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="h-16 max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand / Protocol identification */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-neon-cyan">
              <Lock className="w-4 h-4" />
            </div>
            <span className="font-mono font-extrabold text-base sm:text-lg tracking-wider text-on-surface uppercase">
              The Vault
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="px-2 py-0.5 bg-surface-container-high rounded text-primary font-mono text-[11px] uppercase tracking-wider">
              Protocol v4.2
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-high rounded text-tertiary font-mono text-[11px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              Encrypted
            </span>
          </div>
        </div>

        {/* Central Game Mode Navigation */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center p-1 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => onSelectMode('daily')}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
                gameMode === 'daily'
                  ? 'bg-surface-container-highest text-primary shadow-sm border border-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Daily Breach
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('unlimited')}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
                gameMode === 'unlimited'
                  ? 'bg-surface-container-highest text-primary shadow-sm border border-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Unlimited Drill
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('timeAttack')}
              className={`hidden sm:block px-3 py-1 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
                gameMode === 'timeAttack'
                  ? 'bg-surface-container-highest text-primary shadow-sm border border-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Time Attack
            </button>
          </nav>

          {/* Quick Attempts Mini-Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-xl border border-outline-variant/30 font-mono text-xs">
            <span className="text-on-surface-variant uppercase text-[10px] tracking-widest">
              Attempts
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxAttempts }).map((_, idx) => {
                const isSpent = idx < attemptsUsed;
                const isCurrent = idx === attemptsUsed;
                return (
                  <span
                    key={idx}
                    className={`w-1.5 h-3 rounded-sm transition-all ${
                      isSpent
                        ? 'bg-error/60'
                        : isCurrent
                        ? 'bg-secondary animate-pulse shadow-neon-amber'
                        : 'bg-surface-container-highest'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-primary font-bold">
              {String(attemptsUsed).padStart(2, '0')}/{String(maxAttempts).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Right Action Rail (Streak, Audio Mute, Stats) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Win Streak Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-low border border-secondary/20 rounded-xl">
            <Flame className="w-4 h-4 text-secondary animate-pulse" />
            <span className="font-mono text-xs font-bold text-secondary">
              {currentStreak} <span className="hidden sm:inline">STREAK</span>
            </span>
          </div>

          {/* Audio Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-8 h-8 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-error" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Stats Dialog Trigger */}
          <button
            type="button"
            onClick={onOpenStats}
            aria-label="View Career Statistics"
            className="w-8 h-8 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Operator Identifier Badge */}
          <div className="hidden xl:flex flex-col text-right pl-2 border-l border-outline-variant/30">
            <span className="font-mono text-[9px] text-on-surface-variant leading-none">OPERATOR</span>
            <span className="font-mono text-xs text-primary font-bold leading-tight">OPR-8840</span>
          </div>
        </div>
      </div>
    </header>
  );
}
