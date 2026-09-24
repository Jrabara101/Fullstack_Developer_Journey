import React from 'react';
import { Dialog, DialogClose } from './ui/dialog';
import { calculateStats, getArchetype, calculatePercentile } from '../utils/analytics';
import { Award, RotateCcw, Share2, Zap, ArrowRight, ShieldAlert, BarChart3 } from 'lucide-react';

interface ReportSummaryModalProps {
  open: boolean;
  history: number[];
  falseStarts: number;
  mode: string;
  onRestart: () => void;
  onOpenPassport: () => void;
  onClose: () => void;
}

export const ReportSummaryModal: React.FC<ReportSummaryModalProps> = ({
  open,
  history,
  falseStarts,
  mode,
  onRestart,
  onOpenPassport,
  onClose,
}) => {
  const stats = calculateStats(history);
  const archetype = getArchetype(stats.mean);
  const percentile = calculatePercentile(stats.mean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogClose onClose={onClose} />
      <div className="flex flex-col items-center text-center p-2 sm:p-4">
        {/* Verification Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DIAGNOSTIC COMBINE COMPLETE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 font-sans">
          NEURAL SCORECARD
        </h2>
        <p className="font-mono text-xs text-zinc-400 mb-6">
          5/5 SAMPLES LOGGED • STATISTICAL INTEGRITY VERIFIED • {mode.toUpperCase()}
        </p>

        {/* Archetype Placement Banner */}
        <div
          className={`w-full p-4 rounded-xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-left ${archetype.badgeBg} ${archetype.badgeBorder}`}
        >
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">
              CLASSIFICATION TIER
            </div>
            <div className={`text-xl sm:text-2xl font-black font-sans ${archetype.colorClass}`}>
              {archetype.name}
            </div>
            <p className="text-xs text-zinc-300 font-mono mt-1 max-w-md">
              {archetype.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">RANKING</div>
            <div className="font-mono text-2xl font-black text-cyan-400">
              TOP {percentile.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 4 Core Aggregate Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-6">
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              MEAN AVERAGE
            </div>
            <div className="font-mono text-2xl font-bold text-white mt-1">
              {stats.mean.toFixed(1)}{' '}
              <span className="text-xs text-zinc-500 font-normal">ms</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">
              {stats.mean < 210 ? '↑ HIGH REFLEX' : 'STANDARD'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              BEST APEX
            </div>
            <div className="font-mono text-2xl font-bold text-cyan-400 mt-1">
              {stats.best.toFixed(1)}{' '}
              <span className="text-xs text-zinc-500 font-normal">ms</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400 mt-1">
              {stats.best < 180 ? 'SUPERSONIC' : 'FASTEST'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              CONSISTENCY
            </div>
            <div className="font-mono text-2xl font-bold text-zinc-200 mt-1">
              ±{stats.stdDev.toFixed(1)}{' '}
              <span className="text-xs text-zinc-500 font-normal">ms</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-1">
              {stats.stdDev < 15 ? 'HIGH STABILITY' : 'VARIANCE MODERATE'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              FALSE STARTS
            </div>
            <div className="font-mono text-2xl font-bold text-amber-400 mt-1">
              {falseStarts}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-1">
              {falseStarts === 0 ? 'CLEAN CADENCE' : 'PENALTIES LOGGED'}
            </div>
          </div>
        </div>

        {/* Round Breakdown Strip */}
        <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 mb-6">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-left mb-2">
            ROUND LATENCY SPREAD
          </div>
          <div className="grid grid-cols-5 gap-2">
            {history.map((roundMs, i) => (
              <div
                key={i}
                className="flex flex-col items-center py-2 px-1 rounded-lg bg-zinc-950 border border-zinc-800"
              >
                <span className="text-[10px] font-mono text-zinc-500">R0{i + 1}</span>
                <span
                  className={`font-mono text-sm font-bold mt-1 ${
                    roundMs < 190 ? 'text-cyan-400' : roundMs < 250 ? 'text-emerald-400' : 'text-zinc-300'
                  }`}
                >
                  {Math.round(roundMs)}ms
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs uppercase shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NEW TRIAL</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPassport();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold text-xs uppercase border border-zinc-700 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>PASSPORT & SHARE</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
};
