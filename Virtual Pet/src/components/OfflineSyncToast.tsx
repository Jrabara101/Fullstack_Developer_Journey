import type { SyncResponse } from '../types/pet';
import { Clock, X } from 'lucide-react';

interface OfflineSyncToastProps {
  report: NonNullable<SyncResponse['offlineReport']>;
  onDismiss: () => void;
}

export const OfflineSyncToast: React.FC<OfflineSyncToastProps> = ({ report, onDismiss }) => {
  return (
    <div className="absolute top-20 right-4 z-40 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="glass-hud-subtle rounded-2xl p-4 shadow-2xl border border-indigo-500/40 flex flex-col gap-2.5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-xs text-white">Circadian Reconciliation</h4>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-snug">{report.summaryText}</p>

        <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400">Offline Time:</span>{' '}
            <strong className="text-cyan-300">{report.hoursAway}h</strong>
          </div>
          <div>
            <span className="text-slate-400">Droppings:</span>{' '}
            <strong className="text-amber-300">+{report.wasteSpawned}</strong>
          </div>
          <div>
            <span className="text-slate-400">Hunger Decay:</span>{' '}
            <strong className="text-rose-400">-{report.decayApplied.hungerLoss}%</strong>
          </div>
          <div>
            <span className="text-slate-400">Energy Delta:</span>{' '}
            <strong className="text-purple-300">
              {report.decayApplied.energyChange >= 0 ? '+' : ''}
              {report.decayApplied.energyChange}%
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
