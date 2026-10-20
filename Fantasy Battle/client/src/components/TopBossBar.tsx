import React, { useState } from 'react';
import type { ArenaGameState } from '../types';
import { Trophy, Settings, Copy, Check, Flame } from 'lucide-react';

interface TopBossBarProps {
  gameState: ArenaGameState;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const TopBossBar: React.FC<TopBossBarProps> = ({
  gameState,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);

  const boss = gameState.enemies.find(e => e.archetype === 'BOSS_WARLORD');

  const copySeed = () => {
    navigator.clipboard.writeText(gameState.seed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format survival timer
  const totalSeconds = Math.floor(gameState.stats.timeElapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((gameState.stats.timeElapsedMs % 1000) / 100);
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none flex items-start justify-between gap-4">
      {/* Left: Seed Pill & Leaderboard trigger */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono border border-amber-500/20 text-slate-300">
          <span className="text-amber-400 font-bold tracking-wider">TRIAL</span>
          <span className="text-white font-medium">{gameState.seed}</span>
          <button
            onClick={copySeed}
            title="Copy Seed to clipboard"
            className="text-slate-400 hover:text-amber-400 transition-colors p-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={onOpenLeaderboard}
          title="Daily Leaderboard"
          className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 hover:border-amber-500/40 transition-all border border-amber-500/20"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Leaderboard</span>
        </button>
      </div>

      {/* Center: Boss Health Bar OR Wave Progress Banner */}
      <div className="flex-1 max-w-xl mx-auto flex flex-col items-center pointer-events-auto">
        {boss ? (
          <div className="w-full glass-panel p-3 rounded-xl border border-red-500/30 shadow-2xl animate-fade-in">
            {/* Boss Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-bold text-sm md:text-base text-white tracking-wider flex items-center gap-1.5">
                  {boss.name}
                  {boss.phase === 3 && (
                    <span className="bg-red-950/80 text-red-400 border border-red-500/40 text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-500 animate-pulse" /> ENRAGED
                    </span>
                  )}
                </span>
              </div>

              {/* Phase Pips */}
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <span className={boss.phase && boss.phase >= 1 ? 'text-amber-400' : 'text-slate-600'}>◆</span>
                <span className={boss.phase && boss.phase >= 2 ? 'text-amber-400' : 'text-slate-600'}>◆</span>
                <span className={boss.phase && boss.phase >= 3 ? 'text-red-500' : 'text-slate-600'}>◆</span>
              </div>
            </div>

            {/* Monumental Boss Health Bar */}
            <div className="relative w-full h-4 bg-slate-950/90 rounded-sm overflow-hidden border border-red-950">
              <div
                className="h-full bg-gradient-to-r from-red-700 via-red-600 to-rose-500 transition-all duration-150 rounded-sm"
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/90 font-bold drop-shadow">
                {boss.hp} / {boss.maxHp}
              </div>
            </div>

            {/* Boss Posture / Poise Gauge */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider text-amber-400/80 uppercase">Posture</span>
              <div className="flex-1 h-1.5 bg-slate-950/90 rounded-full overflow-hidden border border-amber-950/60">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    boss.isStaggered ? 'bg-amber-400 animate-pulse' : 'bg-gradient-to-r from-amber-600 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (boss.posture / 100) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-amber-400/90 font-semibold">
                {Math.round(boss.posture)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border border-amber-500/20">
            <span className="font-cinzel text-xs md:text-sm font-semibold tracking-widest text-amber-400 uppercase">
              Wave {gameState.currentWave} Gauntlet
            </span>
            <span className="text-slate-500 text-xs">&bull;</span>
            <span className="font-mono text-xs text-slate-300">
              {gameState.enemies.length} {gameState.enemies.length === 1 ? 'Foe' : 'Foes'} Remaining
            </span>
          </div>
        )}
      </div>

      {/* Right: Wave Counter & Survival Timer & Settings */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono border border-amber-500/20 text-slate-300">
          <span className="text-amber-400 font-bold">WAVE</span>
          <span className="text-white font-semibold">{gameState.currentWave} / {gameState.totalWaves}</span>
        </div>

        <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono border border-cyan-500/20 text-cyan-300 font-bold">
          <span>{formattedTimer}</span>
        </div>

        <button
          onClick={onOpenSettings}
          title="Game Settings"
          className="glass-panel p-2 rounded-lg text-slate-400 hover:text-white hover:border-amber-500/40 transition-colors border border-slate-800"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
