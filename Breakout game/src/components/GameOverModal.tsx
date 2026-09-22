import React, { useEffect } from 'react';
import { GameStats } from '../game/types';
import { Award, RotateCcw, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

interface GameOverModalProps {
  stats: GameStats;
  isOpen: boolean;
  onRestart: () => void;
  onNextSector: () => void;
  onOpenLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isOpen,
  onRestart,
  onNextSector,
  onOpenLevelSelect,
}) => {
  useEffect(() => {
    if (isOpen && stats.isVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#d946ef', '#10b981', '#f59e0b'],
        });
      } catch {}
    }
  }, [isOpen, stats.isVictory]);

  if (!isOpen) return null;

  const isWin = stats.isVictory;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div 
        className={cn(
          "glass-panel-glow rounded-2xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl border transition-all transform scale-100",
          isWin ? "border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)]" : "border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)]"
        )}
      >
        {/* Top Glow Ambient Blob */}
        <div 
          className={cn(
            "absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl pointer-events-none",
            isWin ? "bg-cyan-500/20" : "bg-rose-500/20"
          )}
        />

        {/* Header Status & Rank Badge */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <span 
              className={cn(
                "p-2.5 rounded-xl border",
                isWin 
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              )}
            >
              {isWin ? <Award className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Mission Report — Sector 0{stats.activeSector}
              </span>
              <h3 
                className={cn(
                  "font-display font-black text-xl tracking-wide uppercase",
                  isWin ? "text-cyan-300" : "text-rose-400"
                )}
              >
                {isWin ? "SECTOR PURGED" : "SHIELD CORE BREACHED"}
              </h3>
            </div>
          </div>

          <span 
            className={cn(
              "px-3 py-1 rounded-md font-mono font-black text-xs shadow-md tracking-wider uppercase",
              stats.rank === 'S+' 
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950" 
                : stats.rank === 'A' 
                  ? "bg-cyan-500 text-slate-950" 
                  : "bg-slate-800 text-slate-300 border border-slate-700"
            )}
          >
            RANK {stats.rank}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-5 font-mono relative z-10">
          <div className="p-3 rounded-xl bg-slate-900/85 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Final Score</span>
            <p className="text-2xl font-bold text-cyan-400 tabular-nums mt-0.5">
              {stats.score.toLocaleString('en-US', { minimumIntegerDigits: 6 })}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/85 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Sector Best</span>
            <p className="text-2xl font-bold text-white tabular-nums mt-0.5">
              {stats.highScore.toLocaleString('en-US', { minimumIntegerDigits: 6 })}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/85 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Bricks Shattered</span>
            <p className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
              {stats.bricksDestroyed} / {stats.totalBricks}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/85 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Max Combo Streak</span>
            <p className="text-xl font-bold text-fuchsia-400 tabular-nums mt-0.5">
              x{stats.maxCombo} STREAK
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-6 relative z-10">
          {isWin ? (
            <button 
              onClick={onNextSector}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono font-bold text-sm tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>NEXT SECTOR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={onRestart}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-mono font-bold text-sm tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RETRY SECTOR [SPACE]</span>
            </button>
          )}

          <div className="flex gap-2">
            <button 
              onClick={onRestart}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono font-medium text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </button>
            <button 
              onClick={onOpenLevelSelect}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono font-medium text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SELECT SECTOR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
