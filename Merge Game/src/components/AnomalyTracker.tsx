// ----------------------------------------------------
// Anomaly Tracker: Dynamic Hazard Objective Banner
// ----------------------------------------------------

import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { AlertTriangle, Sparkles, Skull } from 'lucide-react';

export const AnomalyTracker: React.FC = () => {
  const { anomalies } = useGameStore();

  if (anomalies.length === 0) {
    return (
      <div className="w-full max-w-[580px] mx-auto mb-2 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Crucible Stability: 100% (No Active Anomalies)</span>
        </div>
        <span className="text-[10px] text-slate-500">Board Clear</span>
      </div>
    );
  }

  const anomaly = anomalies[0];
  const isUrgent = anomaly.turnsLeft <= 3;

  return (
    <div
      className={`w-full max-w-[580px] mx-auto mb-2 px-3 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
        isUrgent
          ? 'bg-rose-950/70 border-rose-500 text-rose-200 animate-jitter shadow-lg shadow-rose-950/50'
          : 'bg-slate-900/90 border-amber-600/60 text-amber-200 shadow-md'
      }`}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <Skull className="w-4 h-4 text-rose-400 animate-bounce" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wide">
              {anomaly.type === 'rift' ? '🌀 Dimensional Rift' : anomaly.type === 'geode' ? '💎 Unstable Geode' : '☣️ Creeping Corruption'}
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-900/60 text-amber-300'
              }`}
            >
              {anomaly.turnsLeft} {anomaly.turnsLeft === 1 ? 'Turn' : 'Turns'} Left!
            </span>
          </div>

          <p className="text-[10px] text-slate-300">
            Merge on adjacent cells to crack it open! Progress:{' '}
            <span className="font-mono font-bold text-white">
              {anomaly.hitsTaken} / {anomaly.hitsRequired} hits
            </span>
          </p>
        </div>
      </div>

      <div className="text-right font-mono text-[10px] text-slate-400">
        Reward: <span className="text-cyan-300 font-bold">Wildcard T{anomaly.rewardTier}</span>
      </div>
    </div>
  );
};
