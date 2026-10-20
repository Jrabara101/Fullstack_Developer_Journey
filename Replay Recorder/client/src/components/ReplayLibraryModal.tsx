import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Ghost,
  Upload,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  RefreshCw,
  Award
} from 'lucide-react';
import { ReplayMetadata, ReplayPayload } from '../types/replay';

interface ReplayLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadReplay: (metadata: ReplayMetadata, payload: ReplayPayload) => void;
  onLoadGhost: (metadata: ReplayMetadata, payload: ReplayPayload) => void;
}

export const ReplayLibraryModal: React.FC<ReplayLibraryModalProps> = ({
  isOpen,
  onClose,
  onLoadReplay,
  onLoadGhost
}) => {
  const [replays, setReplays] = useState<ReplayMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>('cloud');

  const fetchReplays = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/replays');
      if (res.ok) {
        const data = await res.json();
        setReplays(data);
      }
    } catch (err) {
      console.error('Failed to load replays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReplays();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectReplay = async (id: string, asGhost = false) => {
    try {
      const res = await fetch(`/api/replays/${id}`);
      if (res.ok) {
        const fullData = await res.json();
        if (asGhost) {
          onLoadGhost(fullData.metadata, fullData.payload);
        } else {
          onLoadReplay(fullData.metadata, fullData.payload);
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to retrieve full replay:', err);
    }
  };

  const handleDeleteReplay = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Permanently delete replay from SQLite archive?')) return;
    try {
      await fetch(`/api/replays/${id}`, { method: 'DELETE' });
      setReplays(prev => prev.filter(r => r.replayId !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.metadata && json.payload) {
          onLoadReplay(json.metadata, json.payload);
          onClose();
        } else {
          alert('Invalid .replay JSON file format.');
        }
      } catch (err) {
        alert('Failed to parse replay file.');
      }
    };
    reader.readAsText(file);
  };

  const formatDuration = (ms: number) => {
    const totalSecs = Math.round(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-3xl bg-[#0E1424] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              <span>MATCH REPLAY ARCHIVES</span>
              <span className="text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full font-mono">
                SQLITE PERSISTENCE
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Load past matches for cinematic theater review or comparative Ghost Duels.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'cloud'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Cloud Database ({replays.length})
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'local'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Import Local File
            </button>
          </div>

          {activeTab === 'cloud' && (
            <button
              onClick={fetchReplays}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-sky-400 bg-slate-900/80 rounded-lg border border-slate-800 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* Tab 1: Cloud Replays List */}
        {activeTab === 'cloud' && (
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-mono">
                Querying Fastify + SQLite replay store...
              </div>
            ) : replays.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                No recorded replays found in SQLite database.
              </div>
            ) : (
              replays.map((r) => (
                <div
                  key={r.replayId}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-850 flex items-center justify-between gap-4 transition group"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{r.gameTitle}</h4>
                      {r.isVerified ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED ({r.verificationScore ?? 100})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800/60">
                          <ShieldAlert className="w-3 h-3" /> ANOMALY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>PILOT: <strong className="text-slate-300">{r.authorName}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        {formatDuration(r.durationMs)} ({r.totalTicks} TICKS)
                      </span>
                      <span>·</span>
                      <span>{r.markers?.length || 0} BOOKMARKS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Load Primary */}
                    <button
                      onClick={() => handleSelectReplay(r.replayId, false)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-sm active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>PLAY</span>
                    </button>

                    {/* Load as Ghost */}
                    <button
                      onClick={() => handleSelectReplay(r.replayId, true)}
                      title="Load as secondary Ghost run for comparative split overlay"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/60 text-cyan-300 border border-slate-700 hover:border-cyan-500/60 text-xs font-bold transition active:scale-95"
                    >
                      <Ghost className="w-3.5 h-3.5" />
                      <span>GHOST</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDeleteReplay(r.replayId, e)}
                      title="Delete replay"
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Local Replay File Upload */}
        {activeTab === 'local' && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl p-8 text-center transition group">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Select `.replay` Telemetry File</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Instantly decode and load any JSON-formatted replay flight recording directly into the theater deck.
            </p>
            <label className="cursor-pointer px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wide shadow-md active:scale-95 transition">
              <span>CHOOSE FILE</span>
              <input
                type="file"
                accept=".replay,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
