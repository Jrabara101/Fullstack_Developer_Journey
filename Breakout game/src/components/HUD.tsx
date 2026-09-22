import React from 'react';
import { GameStats } from '../game/types';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  SlidersHorizontal, 
  Trophy, 
  Zap, 
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HUDProps {
  stats: GameStats;
  soundEnabled: boolean;
  isPaused: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onOpenLevelSelect: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  soundEnabled,
  isPaused,
  onToggleSound,
  onTogglePause,
  onOpenSettings,
  onOpenLevelSelect,
}) => {
  return (
    <header className="w-full max-w-5xl z-20 transition-all duration-300">
      <div className="glass-panel-glow rounded-2xl px-4 py-3 md:px-6 md:py-3.5 flex items-center justify-between shadow-2xl relative overflow-hidden">
        {/* Top edge neon gradient highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90"></div>

        {/* LEFT: CURRENT SCORE & DYNAMIC COMBO BADGE */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-mono font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Current Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono tabular-nums text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_14px_rgba(6,182,212,0.6)]">
                {stats.score.toLocaleString('en-US', { minimumIntegerDigits: 6, useGrouping: true })}
              </span>
            </div>
          </div>

          {/* Combo Multiplier Pill with escalating intensity */}
          {stats.combo > 1 && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-lg transition-all animate-bounce",
              stats.combo >= 6 
                ? "bg-gradient-to-r from-fuchsia-600/30 via-rose-600/30 to-amber-500/30 border-rose-500/60 shadow-[0_0_16px_rgba(244,63,94,0.4)]"
                : "bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.3)]"
            )}>
              <Zap className={cn(
                "w-3.5 h-3.5",
                stats.combo >= 6 ? "text-rose-400 fill-rose-400" : "text-fuchsia-400 fill-fuchsia-400"
              )} />
              <span className="text-xs font-mono font-extrabold text-fuchsia-300 tracking-wide uppercase">
                x{stats.combo} STREAK
              </span>
            </div>
          )}
        </div>

        {/* CENTER: TITLE, SECTOR BADGE & RECORD */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLevelSelect}
              className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-500/40 text-cyan-300 tracking-wider transition-colors flex items-center gap-1 shadow-sm"
              title="Change Sector"
            >
              <Layers className="w-3 h-3" />
              <span>SECTOR 0{stats.activeSector}</span>
            </button>
            <h1 className="font-display font-black text-sm md:text-base tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 drop-shadow">
              CYBER//BREAK
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mt-0.5">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>RECORD:</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {stats.highScore.toLocaleString('en-US', { minimumIntegerDigits: 6 })}
            </span>
          </div>
        </div>

        {/* RIGHT: SHIELD CORE (LIVES) & ACTION UTILITIES */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Shield Core (3 Lives) */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs font-mono uppercase text-slate-400 tracking-wider">Shield Core</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {[0, 1, 2].map((i) => {
                const isActive = i < stats.lives;
                return (
                  <span key={i} className="relative group transition-all duration-300">
                    <Shield 
                      className={cn(
                        "w-4 h-4 md:w-5 md:h-5 transition-colors duration-300",
                        isActive 
                          ? "text-cyan-400 fill-cyan-400/30 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                          : "text-slate-700 fill-transparent"
                      )} 
                    />
                  </span>
                );
              })}
            </div>
          </div>

          {/* Utility Action Buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/60">
            <button 
              onClick={onToggleSound}
              className={cn(
                "p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-700",
                soundEnabled ? "text-slate-300 hover:text-cyan-400" : "text-slate-500 hover:text-slate-300"
              )}
              title={soundEnabled ? "Mute Synth Audio (M)" : "Enable Synth Audio (M)"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button 
              onClick={onTogglePause}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-400 transition-colors border border-slate-700"
              title="Pause Game (Esc / Space)"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button 
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-fuchsia-400 transition-colors border border-slate-700"
              title="Arena Preferences"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
