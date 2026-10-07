import React from 'react';
import type { SaveMetadata } from '../../types/save';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { formatBytes } from '../../lib/utils';
import { sfx } from '../../sounds/sfx';
import {
  Database,
  Cloud,
  CloudAlert,
  CloudOff,
  RefreshCw,
  Share2,
  Volume2,
  VolumeX,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface VaultHeaderProps {
  activeSlotId: string | null;
  activeSlotMetadata?: SaveMetadata | null;
  storageUsage: { usedBytes: number; quotaBytes: number };
  cloudSyncStatus: 'synced' | 'pending' | 'offline' | 'conflict';
  onSyncNow: () => void;
  onOpenExportImport: () => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
  onToggleDisasterModal: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  activeSlotId,
  activeSlotMetadata,
  storageUsage,
  cloudSyncStatus,
  onSyncNow,
  onOpenExportImport,
  onQuickSave,
  onQuickLoad,
  onToggleDisasterModal
}) => {
  const [isMuted, setIsMuted] = React.useState(sfx.getMuted());

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    sfx.setMuted(nextMute);
    setIsMuted(nextMute);
  };

  const percentUsed = Math.min(100, Math.round((storageUsage.usedBytes / storageUsage.quotaBytes) * 100));

  const syncConfig = {
    synced: {
      label: 'CLOUD SYNCED',
      icon: <Cloud size={14} className="text-emerald-400" />,
      badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      led: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
    },
    pending: {
      label: 'SYNC PENDING',
      icon: <RefreshCw size={14} className="text-amber-400 animate-spin" />,
      badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      led: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
    },
    offline: {
      label: 'OFFLINE MODE',
      icon: <CloudOff size={14} className="text-slate-400" />,
      badge: 'border-slate-700 bg-slate-800/40 text-slate-400',
      led: 'bg-slate-500'
    },
    conflict: {
      label: 'TIMELINE CONFLICT',
      icon: <CloudAlert size={14} className="text-rose-400 animate-bounce" />,
      badge: 'border-rose-500/40 bg-rose-500/20 text-rose-300',
      led: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
    }
  };

  const sync = syncConfig[cloudSyncStatus];

  return (
    <header className="w-full bg-[#0D121F]/95 backdrop-blur-xl border border-[#1E293B] rounded-xl p-4 shadow-2xl relative">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Left: Vault Title & Active Slot Indicator */}
        <div className="flex items-center gap-3.5 w-full xl:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wider text-white uppercase font-sans">
                QUANTUM MEMORY ARCHIVE
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v1.2.0
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-slate-400">ACTIVE CARTIDGE:</span>
              <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                {activeSlotId ? activeSlotId.toUpperCase() : 'NO SLOT HYDRATED'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Storage Quota Meter */}
        <div className="w-full xl:w-72 bg-[#07090E]/80 border border-slate-800/90 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-slate-400">STORAGE VAULT QUOTA</span>
            <span className="text-cyan-400 font-bold">
              {formatBytes(storageUsage.usedBytes)} / {formatBytes(storageUsage.quotaBytes)} ({percentUsed}%)
            </span>
          </div>
          <Progress value={percentUsed} color={percentUsed > 80 ? 'coral' : 'cyan'} />
        </div>

        {/* Right: Cloud Sync Beacon, Hotkeys, Mute & Export */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full xl:w-auto">
          {/* Cloud Beacon */}
          <button
            onClick={onSyncNow}
            title="Click to trigger Delta Cloud Sync Reconciler"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-semibold transition-all cursor-pointer hover:brightness-110 ${sync.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${sync.led}`} />
            {sync.icon}
            <span>{sync.label}</span>
          </button>

          {/* Quick-Save Hint Button */}
          <Button
            variant="amber"
            size="sm"
            onClick={onQuickSave}
            title="Quick-Save Checkpoint to Slot quicksave_0"
          >
            <Zap size={13} />
            <span>[F5] QUICK-SAVE</span>
          </Button>

          {/* Quick-Load Hint Button */}
          <Button
            variant="cyan"
            size="sm"
            onClick={onQuickLoad}
            title="Quick-Load Checkpoint from Slot quicksave_0"
          >
            <RefreshCw size={13} />
            <span>[F9] QUICK-LOAD</span>
          </Button>

          {/* Export / Import Drawer Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenExportImport}
            title="Export / Import Save Capsule & QR Code"
          >
            <Share2 size={13} />
            <span>CAPSULE</span>
          </Button>

          {/* Disaster Recovery Trigger */}
          <button
            onClick={onToggleDisasterModal}
            title="Inspect Triple-Buffer Auto-Save Stack & Disaster Recovery"
            className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
          >
            <ShieldAlert size={16} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
