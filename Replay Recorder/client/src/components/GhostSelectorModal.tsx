import React, { useState, useEffect } from 'react';
import {
  X,
  Ghost,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { ReplayMetadata, ReplayPayload } from '../types/replay';

interface GhostSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGhost: ReplayMetadata | null;
  onLoadGhost: (meta: ReplayMetadata, payload: ReplayPayload) => void;
  onRemoveGhost: () => void;
}

export const GhostSelectorModal: React.FC<GhostSelectorModalProps> = ({
  isOpen,
  onClose,
  activeGhost,
  onLoadGhost,
  onRemoveGhost
}) => {
  const [replays, setReplays] = useState<ReplayMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/replays')
        .then(r => r.json())
        .then(data => setReplays(data))
        .catch(err => console.error('Failed to fetch ghost replays:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (id: string) => {
    try {
      const res = await fetch(`/api/replays/${id}`);
      if (res.ok) {
        const full = await res.json();
        onLoadGhost(full.metadata, full.payload);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-xl bg-[#0E1424] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold tracking-tight">GHOST ECHO COMPARATIVE SPLIT</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Overlay a secondary telemetry run to spot route divergences and timing gaps in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Ghost Status */}
        {activeGhost ? (
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-cyan-200 block">ACTIVE GHOST RUN:</span>
                <span className="text-sm font-semibold text-slate-100">{activeGhost.gameTitle}</span>
                <span className="text-[11px] font-mono text-cyan-400/80 block">
                  PILOT: {activeGhost.authorName} ({activeGhost.totalTicks} TICKS)
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onRemoveGhost();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 text-rose-400 border border-slate-700 hover:border-rose-700 text-xs font-bold transition"
            >
              Detach Ghost
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span>No ghost run attached. Select a baseline below to project on the viewport.</span>
          </div>
        )}

        {/* Available Replay Options */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Replay Baselines
          </h4>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="h-24 flex items-center justify-center text-xs text-slate-500 font-mono">
                Querying archives...
              </div>
            ) : replays.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-xs text-slate-500">
                No recorded replays available.
              </div>
            ) : (
              replays.map(r => (
                <div
                  key={r.replayId}
                  onClick={() => handleSelect(r.replayId)}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/60 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition group"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                      {r.gameTitle}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>PILOT: {r.authorName}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> {r.totalTicks} TICKS
                      </span>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                    SELECT
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
