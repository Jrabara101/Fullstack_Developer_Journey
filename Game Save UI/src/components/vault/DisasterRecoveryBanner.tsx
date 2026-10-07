import React from 'react';
import type { SaveMetadata } from '../../types/save';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';
import { ShieldCheck, RotateCcw, AlertTriangle, Layers } from 'lucide-react';

interface DisasterRecoveryBannerProps {
  isCorrupted: boolean;
  errorMessage: string | null;
  slots: Record<string, SaveMetadata>;
  onTriggerRollback: () => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const DisasterRecoveryBanner: React.FC<DisasterRecoveryBannerProps> = ({
  isCorrupted,
  errorMessage,
  slots,
  onTriggerRollback,
  isOpenModal,
  onCloseModal
}) => {
  const autoSlots = ['auto_1', 'auto_2', 'auto_3'].map(id => slots[id]).filter(Boolean);

  // If corrupted, show emergency alert banner
  if (isCorrupted) {
    return (
      <div className="w-full bg-red-950/90 border-2 border-red-500 rounded-xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-conflict-pulse text-white">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-600/20 border border-red-500 rounded-xl text-red-400">
            <AlertTriangle size={24} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-300">
                DISASTER RECOVERY TIME CAPSULE ACTIVATED
              </span>
              <span className="px-1.5 py-0.2 rounded bg-red-500 text-black font-mono font-extrabold text-[10px]">
                CORRUPTED
              </span>
            </div>
            <p className="text-xs text-red-200 font-mono mt-0.5">
              {errorMessage || 'State checksum audit failed. Corrupted schema or illegal values detected.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="destructive"
            size="md"
            onClick={onTriggerRollback}
            className="w-full sm:w-auto px-5 py-2.5 font-bold flex items-center gap-2"
          >
            <RotateCcw size={15} />
            <span>ONE-CLICK ROLLBACK TO SAFE STACK</span>
          </Button>
        </div>
      </div>
    );
  }

  // If user opens the Disaster Recovery Inspector Modal
  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCloseModal} />
        <div className="relative w-full max-w-xl bg-[#0D121F] border border-slate-800 rounded-xl p-5 shadow-2xl z-10 text-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                ROLLING TRIPLE-BUFFER AUTO-SAVE STACK
              </h3>
            </div>
            <button
              onClick={onCloseModal}
              className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-slate-800"
            >
              ESC
            </button>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            The failover engine maintains a rolling triple-buffer stack (`auto_1`, `auto_2`, `auto_3`). When quota drops or interrupted writes occur, the vault automatically rolls back to the freshest uncorrupted checkpoint.
          </p>

          <div className="space-y-2">
            {autoSlots.map((slot) => (
              <div
                key={slot.slotId}
                className="p-3 rounded-lg bg-[#07090E] border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-cyan-300">{slot.slotId.toUpperCase()} — {slot.title}</div>
                  <div className="text-slate-500 text-[11px]">
                    {formatDate(slot.updatedAt)} • Hash: #{slot.checksum ? slot.checksum.slice(0, 8) : 'N/A'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                  <ShieldCheck size={14} />
                  <span>AUDITED</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={onTriggerRollback}
              className="w-full flex items-center justify-center gap-2 py-2"
            >
              <RotateCcw size={14} />
              <span>TEST RECOVERY FAILOVER (RESTORE FRESHEST AUTO-SAVE)</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
