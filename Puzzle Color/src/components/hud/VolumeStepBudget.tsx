import React from 'react';
import { Pipette, Gauge } from 'lucide-react';

interface VolumeStepBudgetProps {
  moveCount: number;
  maxMoves: number;
  currentVolumeMl: number;
  maxVolumeMl: number;
}

export const VolumeStepBudget: React.FC<VolumeStepBudgetProps> = ({
  moveCount,
  maxMoves,
  currentVolumeMl,
  maxVolumeMl,
}) => {
  const volPercent = Math.min(100, (currentVolumeMl / maxVolumeMl) * 100);
  const movesRemaining = Math.max(0, maxMoves - moveCount);

  return (
    <div className="grid grid-cols-2 gap-3 w-full my-1 z-10">
      {/* Injection / Move Budget */}
      <div className="bg-surface-low border border-surface-high/60 p-2.5 rounded-xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Pipette className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs uppercase font-semibold text-slate-300">
            Injections
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs font-bold">
          <span className={movesRemaining <= 2 ? 'text-rose-400' : 'text-primary'}>
            {String(moveCount).padStart(2, '0')}
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{String(maxMoves).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Crucible Chamber Volume Gauge */}
      <div className="bg-surface-low border border-surface-high/60 p-2.5 rounded-xl flex flex-col justify-center gap-1.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-secondary" />
            <span className="font-mono text-[10px] uppercase font-semibold text-slate-300">
              Chamber Vol
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-slate-200">
            {currentVolumeMl.toFixed(1)} / {maxVolumeMl.toFixed(1)} ml
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-surface-lowest rounded-full overflow-hidden border border-surface-container">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              volPercent > 85 ? 'bg-rose-500' : 'bg-secondary'
            }`}
            style={{ width: `${volPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
