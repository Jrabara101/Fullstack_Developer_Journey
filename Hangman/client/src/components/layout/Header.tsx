import React from 'react';
import { Volume2, VolumeX, Shield, Radio, Sparkles, Anchor, Cpu, Rocket } from 'lucide-react';
import type { Difficulty, ThemeId } from '../../../../shared/types';
import { audioEngine } from '../../lib/audio';

interface HeaderProps {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  dailyMode: boolean;
  onToggleDaily: () => void;
  strikes: number;
  maxStrikes: number;
  isConnected: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  difficulty,
  onDifficultyChange,
  dailyMode,
  onToggleDaily,
  strikes,
  maxStrikes,
  isConnected,
  muted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-high/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* BRAND & PROTOCOL */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center border border-primary/40 shadow-[0_0_10px_rgba(78,222,163,0.2)]">
            {theme === 'deep_sea_diver' && <Anchor className="w-5 h-5 text-primary" />}
            {theme === 'steampunk_automaton' && <Cpu className="w-5 h-5 text-primary" />}
            {theme === 'orbital_astronaut' && <Rocket className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-extrabold uppercase tracking-wider text-[#eae1da]">
              THE CIPHER GALLOWS
            </span>
            <span className="font-mono text-[10px] text-primary uppercase flex items-center gap-1.5">
              <span>TAC-OP // PROTOCOL v4.2</span>
              <span className="text-muted-foreground">•</span>
              <span className={`inline-flex items-center gap-1 ${isConnected ? 'text-primary' : 'text-tertiary'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-tertiary'}`} />
                {isConnected ? 'NODE: SYNCED' : 'LOCAL ENGINE'}
              </span>
            </span>
          </div>
        </div>

        {/* CENTER HUD: STRIKES & MODE */}
        <div className="flex items-center gap-4 bg-surface-low px-3 py-1.5 rounded-xl border border-surface-high/40">
          {/* Daily Cipher Badge */}
          <button
            type="button"
            onClick={onToggleDaily}
            className={`font-mono text-[11px] px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
              dailyMode
                ? 'bg-tertiary/20 text-tertiary border-tertiary/50 shadow-[0_0_10px_rgba(255,185,95,0.2)] font-bold'
                : 'text-muted-foreground border-transparent hover:text-[#eae1da]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY CIPHER</span>
          </button>

          {/* Strikes Meter */}
          <div className="flex items-center gap-2 border-l border-surface-high/50 pl-3">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              STRIKES: {String(strikes).padStart(2, '0')}/{String(maxStrikes).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxStrikes }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-3.5 rounded-sm transition-all duration-300 ${
                    idx < strikes
                      ? 'bg-secondary shadow-[0_0_8px_#ffb4ab]'
                      : 'bg-surface-high'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CONTROLS: THEME, DIFFICULTY, AUDIO */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeId)}
            className="bg-surface-low border border-surface-high text-xs font-mono text-[#eae1da] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="deep_sea_diver">🌊 Deep-Sea Diver</option>
            <option value="steampunk_automaton">⚙️ Clockwork Automaton</option>
            <option value="orbital_astronaut">🚀 Orbital Spacewalk</option>
          </select>

          {/* Difficulty Selector */}
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            disabled={dailyMode}
            className="bg-surface-low border border-surface-high text-xs font-mono text-[#eae1da] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-primary disabled:opacity-40 cursor-pointer"
          >
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
            <option value="OBSCURE">OBSCURE</option>
          </select>

          {/* Audio Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            title={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            className="p-2 bg-surface-low hover:bg-surface-high border border-surface-high/60 rounded-lg text-[#eae1da] transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
          </button>
        </div>
      </div>
    </header>
  );
};
