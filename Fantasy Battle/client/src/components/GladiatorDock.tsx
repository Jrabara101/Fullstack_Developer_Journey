import React from 'react';
import type { CombatEntity } from '../types';
import { Shield, ShieldAlert, Heart, Zap, Sparkles } from 'lucide-react';

interface GladiatorDockProps {
  player: CombatEntity & {
    fighterClass: string;
    mana: number;
    maxMana: number;
    abilities: any[];
  };
}

export const GladiatorDock: React.FC<GladiatorDockProps> = ({ player }) => {
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const staPct = Math.max(0, Math.min(100, (player.stamina / player.maxStamina) * 100));
  const manaPct = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));

  const parryAbility = player.abilities.find(a => a.id === 'PARRY');
  const now = performance.now();
  const isParryActive = parryAbility && (now - parryAbility.lastUsedTimestamp < 150);
  const isParryReady = parryAbility && (now - parryAbility.lastUsedTimestamp >= parryAbility.cooldownMs);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Vitals Container */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col gap-2 min-w-[280px]">
        {/* Class Badge & Name */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-cinzel text-xs font-bold tracking-wider text-amber-300 uppercase">
              {player.fighterClass}
            </span>
          </div>
          <span className="font-outfit text-[11px] text-slate-400">Gladiator</span>
        </div>

        {/* 1. Health Bar (Crimson) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <Heart className="w-3 h-3 text-red-500 fill-red-500/30" /> HP
            </span>
            <span className="text-white font-medium">
              {Math.round(player.hp)} <span className="text-slate-500">/ {player.maxHp}</span>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950/90 rounded-sm overflow-hidden border border-red-950/80">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-150 rounded-sm"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* 2. Stamina Bar (Emerald) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500/30" /> STAMINA
            </span>
            <span className="text-white font-medium">
              {Math.round(player.stamina)} <span className="text-slate-500">/ {player.maxStamina}</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950/90 rounded-sm overflow-hidden border border-emerald-950/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-100 rounded-sm"
              style={{ width: `${staPct}%` }}
            />
          </div>
        </div>

        {/* 3. Mana Bar (Sapphire Cyan) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Sparkles className="w-3 h-3 text-cyan-500 fill-cyan-500/30" /> MANA
            </span>
            <span className="text-white font-medium">
              {Math.round(player.mana)} <span className="text-slate-500">/ {player.maxMana}</span>
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950/90 rounded-sm overflow-hidden border border-cyan-950/80">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-100 rounded-sm"
              style={{ width: `${manaPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Defense / Parry Stance Pill */}
      <div
        className={`glass-panel px-3 py-2 rounded-xl flex items-center justify-between border transition-all ${
          isParryActive
            ? 'border-cyan-400 bg-cyan-950/70 runic-glow-cyan text-cyan-300'
            : isParryReady
            ? 'border-amber-500/30 text-amber-300/90'
            : 'border-slate-800 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-mono font-semibold">
          {isParryActive ? (
            <ShieldAlert className="w-4 h-4 text-cyan-300 animate-pulse" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          <span>
            {isParryActive
              ? 'DEFLECT PRIMED (150ms)'
              : isParryReady
              ? 'PARRY READY [RMB]'
              : 'PARRY RECOVERING'}
          </span>
        </div>
        {player.isInvulnerable && (
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
            I-FRAMES
          </span>
        )}
      </div>
    </div>
  );
};
