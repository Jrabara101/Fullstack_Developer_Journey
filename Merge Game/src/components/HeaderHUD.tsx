// ----------------------------------------------------
// Header HUD: Telemetry, Move Gauge, Score, and Triggers
// ----------------------------------------------------

import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { BookOpen, Undo2, Redo2, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';

export const HeaderHUD: React.FC = () => {
  const {
    score,
    movesRemaining,
    maxTierAchieved,
    dailySeed,
    gameMode,
    canUndo,
    canRedo,
    undo,
    redo,
    soundMuted,
    toggleSound,
    setIsCodexOpen,
    verifyRun,
    lastMergeCombo,
    initDailyChallenge,
    initSandbox,
  } = useGameStore();

  return (
    <header className="w-full max-w-4xl mx-auto mb-3 px-3 py-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-2 text-slate-100 select-none">
      {/* Left: Alchemical Crest & Tier Level Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-500/40 flex items-center justify-center text-lg shadow-inner">
            ⚗️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-sm tracking-tight text-white">
                ALCHEMICAL CRUCIBLE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                LVL {String(maxTierAchieved).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <button
                onClick={initSandbox}
                className={`hover:text-emerald-400 transition-colors ${gameMode === 'sandbox' ? 'text-emerald-400 font-bold' : ''}`}
              >
                Sandbox
              </button>
              <span>•</span>
              <button
                onClick={() => initDailyChallenge()}
                className={`hover:text-amber-400 transition-colors ${gameMode === 'daily' ? 'text-amber-400 font-bold' : ''}`}
              >
                Daily Seed
              </button>
            </div>
          </div>
        </div>

        {/* Undo / Redo controls */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo Move [Z]"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700/60"
          >
            <Undo2 className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo Move [Y]"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700/60"
          >
            <Redo2 className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Center: Daily Seed Pill Badge & Move Budget Gauge */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-900/60 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-cyan-300">
            {dailySeed || 'ALCH-SEED'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 font-mono text-xs">
          <span className="text-slate-400">Moves:</span>
          <span
            className={`font-bold px-1.5 rounded ${
              movesRemaining <= 10
                ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                : 'text-white'
            }`}
          >
            {movesRemaining}
          </span>
        </div>
      </div>

      {/* Right: Score Counter, Combo Tag & Action Triggers */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Score & Combo */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs font-mono text-slate-400">PTS</span>
            <span className="text-base sm:text-lg font-mono font-extrabold text-amber-300 tracking-tight">
              {score.toLocaleString()}
            </span>
          </div>

          {lastMergeCombo ? (
            <div className="text-[10px] font-mono text-emerald-400 font-bold animate-bloom flex items-center justify-end gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
              <span>{lastMergeCombo.label}</span>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-slate-500">x1.0 BASE</div>
          )}
        </div>

        {/* Action Triggers: Sound, Codex, Verify */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all text-slate-300"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Codex Drawer Trigger */}
          <button
            onClick={() => setIsCodexOpen(true)}
            title="Open Alchemical Codex"
            className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800 text-cyan-300 transition-all flex items-center gap-1 text-xs font-mono"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Codex</span>
          </button>

          {/* Authoritative Run Verification */}
          <button
            onClick={verifyRun}
            title="Submit & Verify Seeded Run (Anti-Cheat Ledger)"
            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 transition-all flex items-center gap-1 text-xs font-mono"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Verify</span>
          </button>
        </div>
      </div>
    </header>
  );
};
