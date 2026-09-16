import React from 'react';
import { useArcadeStore } from '../store/useArcadeStore';
import { formatNum } from '../utils/formatters';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const highScore = useArcadeStore((s) => s.highScore);
  const soundActive = useArcadeStore((s) => s.soundActive);
  const toggleSound = useArcadeStore((s) => s.toggleSound);

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#0c031bf0]/90 backdrop-blur-md border-b-2 border-fuchsia-500/60 shadow-[0_4px_25px_rgba(236,72,153,0.35)]">
      <div className="h-20 w-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo / Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-none animate-ping" />
            <span className="font-['Righteous'] text-xl sm:text-2xl tracking-wider uppercase chrome-text italic transform -skew-x-6">
              SYNTH-RUNNER
            </span>
            <span className="hidden xs:inline-block bg-fuchsia-950/90 text-pink-400 border border-pink-500 px-2 py-0.5 text-xs sm:text-sm tracking-widest uppercase font-bold shadow-[0_0_8px_#ec4899]">
              PALM DRIVE '84
            </span>
          </div>

          {/* High score ticker */}
          <div className="hidden xl:flex items-center gap-4 pl-4 border-l border-fuchsia-800/80 bg-black/40 px-3 py-1">
            <span className="text-yellow-400 font-bold tracking-widest text-glow-gold">HIGH SCORE:</span>
            <span className="text-white text-2xl font-bold tracking-widest">{formatNum(highScore)} [HEX]</span>
            <span className="text-cyan-400 tracking-widest pl-2">RAD RACER:</span>
            <span className="text-fuchsia-300 font-bold">KAVINSKY-84</span>
          </div>
        </div>

        {/* Navigation Link Tags */}
        <nav className="hidden lg:flex items-center gap-3">
          <button
            className="transition-all bg-gradient-to-r from-pink-600 to-purple-600 text-white font-['Righteous'] text-xs sm:text-sm tracking-wider px-3.5 py-1.5 border border-pink-300 shadow-[0_0_12px_#ec4899]"
            type="button"
          >
            LASER ARENA
          </button>
          <button
            onClick={onOpenSettings}
            className="font-['Righteous'] text-xs sm:text-sm tracking-wider px-3 py-1.5 text-cyan-300 hover:text-white hover:bg-cyan-950/60 border border-cyan-800/60 transition-all"
            type="button"
          >
            MANUAL & RULES
          </button>
        </nav>

        {/* Right HUD Indicators & Toggles */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* FM Radio Station Indicator */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/70 px-3 py-1 border border-cyan-500/70 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <span className="material-symbols-outlined text-cyan-400 text-sm animate-pulse">radio</span>
            <span className="text-cyan-300 tracking-widest text-sm font-bold">FM 104.2 NIGHT-DRIVE</span>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-1.5 bg-yellow-950/50 px-2.5 sm:px-3 py-1 border border-yellow-400/80 shadow-[0_0_12px_rgba(250,204,21,0.4)]">
            <span className="material-symbols-outlined text-yellow-300 text-sm">toll</span>
            <span className="font-bold text-yellow-300 uppercase tracking-widest text-base sm:text-lg">CREDITS: 04</span>
          </div>

          {/* Sound Toggle */}
          <button
            aria-label="Toggle Synth Audio"
            onClick={toggleSound}
            className={`flex items-center justify-center p-2 border border-pink-500 text-pink-300 hover:text-white transition-all shadow-[0_0_10px_#ec4899] active:scale-95 ${
              soundActive ? 'bg-pink-950/60 hover:bg-pink-900' : 'bg-black/60 opacity-50'
            }`}
            title={soundActive ? 'Audio Active (Click to Mute)' : 'Audio Muted (Click to Unmute)'}
          >
            <span className="material-symbols-outlined text-lg">
              {soundActive ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Settings button on mobile/tablet */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center p-2 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500 text-cyan-300 hover:text-white transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)] active:scale-95"
            title="Settings & Guide"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
          </button>
        </div>
      </div>
    </header>
  );
};
