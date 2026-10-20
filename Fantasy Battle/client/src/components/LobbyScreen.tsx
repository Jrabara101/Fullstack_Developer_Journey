import React from 'react';
import type { FighterClass } from '../types';
import { CLASS_CONFIGS } from '../game/classes';
import { Shield, Sparkles, Zap, Trophy, Play, Settings } from 'lucide-react';

interface LobbyScreenProps {
  seed: string;
  selectedClass: FighterClass;
  onSelectClass: (c: FighterClass) => void;
  onStartBattle: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  seed,
  selectedClass,
  onSelectClass,
  onStartBattle,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const classes: FighterClass[] = ['WARRIOR', 'BATTLE_MAGE', 'ROGUE'];

  return (
    <div className="absolute inset-0 z-40 bg-[#06080D]/95 backdrop-blur-md flex flex-col justify-between p-6 md:p-10 overflow-y-auto animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-mono text-slate-300">
          <span className="text-amber-400 font-bold">DAILY SEED:</span> {seed}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLeaderboard}
            className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-cinzel font-bold text-amber-400 hover:text-amber-300 border border-amber-500/20 transition-all"
          >
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
          <button
            onClick={onOpenSettings}
            className="glass-panel p-2 rounded-lg text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Title & Vision */}
      <div className="text-center my-6 max-w-2xl mx-auto">
        <div className="text-amber-400/90 font-cinzel text-xs md:text-sm tracking-[0.35em] uppercase font-semibold mb-2">
          Obsidian Runeglass &bull; 5-Wave Gauntlet
        </div>
        <h1 className="text-4xl md:text-6xl font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)] uppercase">
          Fantasy Battle Arena
        </h1>
        <p className="mt-3 text-xs md:text-sm text-slate-400 font-outfit max-w-lg mx-auto">
          Pits you against telegraphed Soulslike enemy AI in a brutal gladiatorial colosseum.
          Master the <span className="text-cyan-400 font-semibold">150ms Parry Window</span>, shatter enemy posture gauges, and weave elemental combos.
        </p>
      </div>

      {/* Class Selection Grid */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {classes.map((cls) => {
          const cfg = CLASS_CONFIGS[cls];
          const isSelected = selectedClass === cls;

          return (
            <div
              key={cls}
              onClick={() => onSelectClass(cls)}
              className={`p-5 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-amber-400 runic-glow-gold scale-[1.02] shadow-2xl'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
                    {cls === 'WARRIOR' && <Shield className="w-5 h-5 text-amber-400" />}
                    {cls === 'BATTLE_MAGE' && <Sparkles className="w-5 h-5 text-cyan-400" />}
                    {cls === 'ROGUE' && <Zap className="w-5 h-5 text-emerald-400" />}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                </div>

                <h3 className="font-cinzel text-base font-bold text-white tracking-wide">
                  {cfg.title}
                </h3>
                <div className="text-[11px] font-outfit text-amber-400/80 mb-3">
                  {cfg.subtitle}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {cfg.description}
                </p>

                {/* Vitals preview */}
                <div className="flex flex-col gap-1.5 text-[11px] font-mono text-slate-300 mb-4 bg-slate-950/50 p-2.5 rounded-xl border border-slate-900">
                  <div className="flex justify-between">
                    <span className="text-red-400">Health:</span>
                    <span className="font-bold">{cfg.maxHp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Stamina:</span>
                    <span className="font-bold">{cfg.maxStamina}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">Mana:</span>
                    <span className="font-bold">{cfg.maxMana}</span>
                  </div>
                </div>
              </div>

              {/* Passive Ability Pill */}
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[10px] font-outfit text-amber-300/90 leading-tight">
                {cfg.passiveText}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enter the Colosseum CTA */}
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          onClick={onStartBattle}
          className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-cinzel font-black text-lg tracking-[0.2em] uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center gap-3"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Enter The Colosseum</span>
        </button>
        <span className="text-[11px] font-mono text-slate-500">
          Universal Input Parity &bull; WASD / Mouse 360° / Touch Thumbstick
        </span>
      </div>
    </div>
  );
};
