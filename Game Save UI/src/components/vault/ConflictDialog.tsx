import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import type { SyncConflictPayload } from '../../types/save';
import { formatPlaytime, formatDate } from '../../lib/utils';
import { GitFork, Cloud, HardDrive, AlertTriangle } from 'lucide-react';

interface ConflictDialogProps {
  isOpen: boolean;
  conflict: SyncConflictPayload | null;
  onResolve: (slotId: string, resolution: 'keep_local' | 'keep_cloud' | 'fork_both') => void;
  onClose: () => void;
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  isOpen,
  conflict,
  onResolve,
  onClose
}) => {
  if (!conflict) return null;

  const localMeta = conflict.localSave.metadata;
  const cloudMeta = conflict.cloudSave.metadata;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="DIVERGENT TIMELINE CONFLICT DETECTED"
      description="Local state and remote cloud state have diverged on concurrent vector clocks. Choose your authoritative path."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-lg flex items-center gap-3 text-xs text-rose-200 font-mono">
          <AlertTriangle size={20} className="text-rose-400 shrink-0" />
          <span>
            Non-monotonic state progression detected for slot <strong>{conflict.slotId}</strong>.
            Preserving both creates an explicit parallel timeline branch to safeguard your playthrough.
          </span>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local State Card */}
          <div className="bg-[#07090E] border-2 border-cyan-500/50 rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase font-mono">
                <HardDrive size={15} />
                <span>LOCAL CLIENT VAULT</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                v{localMeta.vectorClock || 1}
              </span>
            </div>

            <div className="aspect-video w-full rounded overflow-hidden bg-black border border-slate-800">
              <img
                src={localMeta.thumbnailUrl}
                alt={localMeta.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="font-bold text-white text-sm">{localMeta.title}</div>
              <div className="text-slate-400">Chapter: {localMeta.summary.currentChapter}</div>
              <div className="text-slate-400">Location: {localMeta.summary.currentLocation}</div>
              <div className="text-slate-400">Level: <strong className="text-cyan-300">LVL {localMeta.summary.level}</strong></div>
              <div className="text-slate-400">Playtime: {formatPlaytime(localMeta.summary.playtimeSeconds)}</div>
              <div className="text-slate-400">Updated: {formatDate(localMeta.updatedAt)}</div>
              <div className="text-[10px] text-slate-500">Hash: #{localMeta.checksum.slice(0, 8)}</div>
            </div>

            <Button
              variant="cyan"
              size="sm"
              onClick={() => onResolve(conflict.slotId, 'keep_local')}
              className="w-full py-2"
            >
              KEEP LOCAL ONLY
            </Button>
          </div>

          {/* Cloud State Card */}
          <div className="bg-[#07090E] border-2 border-purple-500/50 rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase font-mono">
                <Cloud size={15} />
                <span>CLOUD BACKUP LEDGER</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                v{cloudMeta.vectorClock || 1}
              </span>
            </div>

            <div className="aspect-video w-full rounded overflow-hidden bg-black border border-slate-800">
              <img
                src={cloudMeta.thumbnailUrl}
                alt={cloudMeta.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="font-bold text-white text-sm">{cloudMeta.title}</div>
              <div className="text-slate-400">Chapter: {cloudMeta.summary.currentChapter}</div>
              <div className="text-slate-400">Location: {cloudMeta.summary.currentLocation}</div>
              <div className="text-slate-400">Level: <strong className="text-purple-300">LVL {cloudMeta.summary.level}</strong></div>
              <div className="text-slate-400">Playtime: {formatPlaytime(cloudMeta.summary.playtimeSeconds)}</div>
              <div className="text-slate-400">Updated: {formatDate(cloudMeta.updatedAt)}</div>
              <div className="text-[10px] text-slate-500">Hash: #{cloudMeta.checksum.slice(0, 8)}</div>
            </div>

            <Button
              variant="violet"
              size="sm"
              onClick={() => onResolve(conflict.slotId, 'keep_cloud')}
              className="w-full py-2"
            >
              KEEP CLOUD ONLY
            </Button>
          </div>
        </div>

        {/* Fork Both: Recommended Action */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-cyan-950/40 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <GitFork size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase">
                RECOMMENDED: FORK BOTH INTO PARALLEL TIMELINES
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Preserves both saves simultaneously without discarding any progression.
              </p>
            </div>
          </div>

          <Button
            variant="emerald"
            size="md"
            onClick={() => onResolve(conflict.slotId, 'fork_both')}
            className="w-full sm:w-auto px-6 py-2.5 font-bold"
          >
            FORK BOTH PATHS
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
