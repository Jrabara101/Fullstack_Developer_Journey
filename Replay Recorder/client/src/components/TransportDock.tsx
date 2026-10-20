import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize2,
  ListOrdered,
  ShieldCheck,
  Ghost,
  Repeat
} from 'lucide-react';
import { ReplaySessionState } from '../types/replay';

interface TransportDockProps {
  sessionState: ReplaySessionState;
  markerCount: number;
  onTogglePlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpSeconds: (sec: number) => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onToggleLooping: () => void;
  onSetLoopRange: (range: [number, number] | null) => void;
  onToggleGhost: () => void;
  onOpenEventsSheet: () => void;
  onOpenVerificationModal: () => void;
  onToggleFullscreen: () => void;
}

export const TransportDock: React.FC<TransportDockProps> = ({
  sessionState,
  markerCount,
  onTogglePlayPause,
  onStepForward,
  onStepBackward,
  onJumpSeconds,
  onSetPlaybackSpeed,
  onToggleLooping,
  onSetLoopRange,
  onToggleGhost,
  onOpenEventsSheet,
  onOpenVerificationModal,
  onToggleFullscreen
}) => {
  const isPlaying = sessionState.status === 'PLAYING' || sessionState.status === 'SLOW_MO';
  const speedOptions = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0];

  const handleSetCurrentAsLoopIn = () => {
    const cur = sessionState.currentTick;
    const end = sessionState.loopRange ? sessionState.loopRange[1] : sessionState.totalTicks;
    onSetLoopRange([cur, Math.max(cur + 60, end)]);
  };

  const handleSetCurrentAsLoopOut = () => {
    const start = sessionState.loopRange ? sessionState.loopRange[0] : 0;
    const cur = sessionState.currentTick;
    onSetLoopRange([Math.min(start, cur - 60), cur]);
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-2.5 bg-[#0E1424]/90 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl">
      {/* Left Transport Auxiliary Controls */}
      <div className="flex items-center gap-2">
        {/* Loop Toggle */}
        <button
          onClick={onToggleLooping}
          title="Toggle A-B Segment Looping"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            sessionState.isLooping
              ? 'bg-sky-500/20 text-sky-400 border-sky-500/60 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>LOOP</span>
        </button>

        {/* Set In/Out Quick Brackets */}
        <div className="flex items-center bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] font-mono">
          <button
            onClick={handleSetCurrentAsLoopIn}
            title="Mark Loop In point at current tick"
            className="px-2 py-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 rounded-l transition"
          >
            [ IN
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={handleSetCurrentAsLoopOut}
            title="Mark Loop Out point at current tick"
            className="px-2 py-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 rounded-r transition"
          >
            OUT ]
          </button>
        </div>

        {/* Ghost Duel Comparative Layer Toggle */}
        <button
          onClick={onToggleGhost}
          title="Toggle Ghost Echo Comparative Path"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            sessionState.isGhostEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Ghost className="w-3.5 h-3.5" />
          <span>GHOST {sessionState.isGhostEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Center Primary Transport Cluster */}
      <div className="flex items-center gap-2">
        {/* Jump -5s (J) */}
        <button
          onClick={() => onJumpSeconds(-5)}
          title="Jump -5 Seconds [J]"
          className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Step Backward 1 Frame (,) */}
        <button
          onClick={onStepBackward}
          title="Step Backward 1 Frame [,]"
          className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition active:scale-95"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Big Master Play / Pause [Space] */}
        <button
          onClick={onTogglePlayPause}
          title="Play / Pause [Space]"
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all shadow-lg active:scale-95 ${
            isPlaying
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/30'
              : 'bg-gradient-to-br from-sky-400 to-sky-600 text-slate-950 shadow-sky-500/30 hover:brightness-110'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-slate-950" />
          ) : (
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          )}
        </button>

        {/* Step Forward 1 Frame (.) */}
        <button
          onClick={onStepForward}
          title="Step Forward 1 Frame [.]"
          className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition active:scale-95"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Jump +5s (L) */}
        <button
          onClick={() => onJumpSeconds(5)}
          title="Jump +5 Seconds [L]"
          className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4 transform -scale-x-100" />
        </button>

        {/* Variable Playback Speed Selector */}
        <div className="relative ml-2">
          <select
            value={sessionState.playbackSpeed}
            onChange={(e) => onSetPlaybackSpeed(Number(e.target.value))}
            title="Playback Speed Multiplier"
            className="bg-slate-900 text-sky-400 border border-slate-700/80 text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 hover:border-slate-600 transition"
          >
            {speedOptions.map(spd => (
              <option key={spd} value={spd} className="bg-slate-950 text-slate-200">
                {spd.toFixed(2)}x {spd < 1.0 ? '(Slow-Mo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Deck Utilities */}
      <div className="flex items-center gap-2.5">
        {/* Anti-Tamper & Desync Verifier trigger */}
        <button
          onClick={onOpenVerificationModal}
          title="Inspect Deterministic Verification Audit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 text-emerald-400 hover:bg-slate-800/90 border border-emerald-500/30 text-xs font-semibold transition hover:border-emerald-500/60"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VERIFIER</span>
        </button>

        {/* Events Drawer Trigger with Counter Badge */}
        <button
          onClick={onOpenEventsSheet}
          title="Open Chronological Event Log"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 text-xs font-semibold transition"
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>EVENTS</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-400 text-[10px] font-mono font-bold">
            {markerCount}
          </span>
        </button>

        {/* Fullscreen Trigger */}
        <button
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen Cinema Mode"
          className="p-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
