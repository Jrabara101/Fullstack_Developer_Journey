import React from 'react';
import {
  Video,
  Database,
  Radio,
  Share2,
  HardDrive,
  FolderOpen
} from 'lucide-react';
import { ReplayMetadata, ReplaySessionState, ReplayEventMarker } from '../types/replay';

interface TopTelemetryBarProps {
  metadata: ReplayMetadata;
  sessionState: ReplaySessionState;
  memoryStats: { bytesUsed: number; maxBytes: number; percentage: number; recordedTicks: number };
  activeMarker: ReplayEventMarker | null;
  onToggleRecording: () => void;
  onOpenExportDialog: () => void;
  onOpenLibraryModal: () => void;
  onOpenGhostSelector: () => void;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  metadata,
  sessionState,
  memoryStats,
  activeMarker,
  onToggleRecording,
  onOpenExportDialog,
  onOpenLibraryModal,
  onOpenGhostSelector
}) => {
  const isRecording = sessionState.status === 'RECORDING';

  const formatMb = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-[#0A0E1A]/90 backdrop-blur-xl border-b border-slate-800/80 z-40">
      {/* Left: Recording Status Badge & Match Title */}
      <div className="flex items-center gap-4">
        {/* REC / REPLAY Capsule */}
        <div
          onClick={onToggleRecording}
          title={isRecording ? 'Click to Stop Recording' : 'Click to Start Live Flight Recording'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border ${
            isRecording
              ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 shadow-[0_0_16px_rgba(239,68,68,0.4)]'
              : 'bg-slate-900 border-slate-700/80 text-sky-400 hover:border-slate-600'
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isRecording
                ? 'bg-rose-500 animate-record-pulse shadow-[0_0_8px_#EF4444]'
                : 'bg-sky-400'
            }`}
          />
          <span className="text-xs font-mono font-bold tracking-wider">
            {isRecording ? '● REC (LIVE)' : '▶ REPLAY DECK'}
          </span>
        </div>

        {/* Replay Title & Author */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">
              {metadata.gameTitle}
            </h1>
            <span className="text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              60Hz BLACK-BOX
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            PILOT: <span className="text-sky-300">{metadata.authorName}</span> · ID: <span className="text-slate-500">{metadata.replayId}</span>
          </p>
        </div>
      </div>

      {/* Center: Current Chapter / Active Milestone Radar Pill */}
      <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-900/80 rounded-full border border-slate-800/80 shadow-inner">
        <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        <span className="text-xs text-slate-400">CLIMAX RADAR:</span>
        {activeMarker ? (
          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            {activeMarker.label}
          </span>
        ) : (
          <span className="text-xs font-mono text-slate-500">AWAITING MILESTONE...</span>
        )}
      </div>

      {/* Right: Ring Buffer Gauge, Archives, Ghost Duel, & Export CTA */}
      <div className="flex items-center gap-3">
        {/* Circular Typed Ring Buffer Usage Gauge */}
        <div className="hidden lg:flex flex-col items-end gap-1 px-3 py-1 bg-slate-900/60 rounded-lg border border-slate-800/60 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-3 h-3 text-sky-400" />
            <span>BUFFER: <strong className="text-slate-200">{memoryStats.percentage}%</strong></span>
            <span className="text-slate-500">({formatMb(memoryStats.bytesUsed)})</span>
          </div>
          {/* Gauge progress bar */}
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                memoryStats.percentage > 85
                  ? 'bg-rose-500 shadow-[0_0_8px_#EF4444]'
                  : 'bg-sky-400 shadow-[0_0_6px_#38BDF8]'
              }`}
              style={{ width: `${Math.max(4, memoryStats.percentage)}%` }}
            />
          </div>
        </div>

        {/* Load Replay Archives Modal Trigger */}
        <button
          onClick={onOpenLibraryModal}
          title="Browse Saved Replay Archives"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold transition"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>ARCHIVES</span>
        </button>

        {/* Ghost Duel Run Selector */}
        <button
          onClick={onOpenGhostSelector}
          title="Load Ghost Replay for Comparative Split"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-cyan-400 hover:text-cyan-200 hover:bg-slate-800 border border-cyan-500/30 text-xs font-semibold transition"
        >
          <Database className="w-3.5 h-3.5" />
          <span>GHOST DUEL</span>
        </button>

        {/* Primary Clip Forge / Export CTA */}
        <button
          onClick={onOpenExportDialog}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-500/20 active:scale-95 transition"
        >
          <Share2 className="w-3.5 h-3.5 fill-slate-950" />
          <span>EXPORT CLIP</span>
        </button>
      </div>
    </header>
  );
};
