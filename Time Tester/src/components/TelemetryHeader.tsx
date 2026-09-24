import React from 'react';
import { ReflexMode } from '../types/reaction';
import { soundManager } from '../utils/audio';
import { Volume2, VolumeX, RotateCcw, SlidersHorizontal, Activity } from 'lucide-react';

interface TelemetryHeaderProps {
  currentRound: number;
  totalRounds: number;
  mode: ReflexMode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetSession: () => void;
  onOpenModes: () => void;
}

export const TelemetryHeader: React.FC<TelemetryHeaderProps> = ({
  currentRound,
  totalRounds,
  mode,
  soundEnabled,
  onToggleSound,
  onResetSession,
  onOpenModes,
}) => {
  const getModeLabel = () => {
    switch (mode) {
      case 'audio':
        return 'AUDITORY_BURST';
      case 'peripheral':
        return 'PERIPHERAL_FLANK';
      case 'visual':
      default:
        return 'VISUAL_FLASH';
    }
  };

  return (
    <header className="relative z-30 pt-6 px-4 sm:px-8 flex items-center justify-between pointer-events-none">
      {/* Brand & Diagnostic Badge */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <span className="font-mono text-xs font-bold tracking-widest text-zinc-100 uppercase">
            SYNAPSE-V4
          </span>
          <span className="text-[10px] font-mono text-zinc-500 border-l border-zinc-800 pl-2">
            SUB_MS
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md font-mono text-[11px] text-zinc-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            LATENCY: <strong className="text-cyan-400 font-bold">RAW / PASSIVE</strong>
          </span>
        </div>
      </div>

      {/* Center Floating Pill: Round Tracker & Mode */}
      <div className="pointer-events-auto flex items-center gap-3 px-4 sm:px-5 py-2 rounded-full bg-zinc-900/95 border border-zinc-700/70 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            ROUND
          </span>
          <div className="font-mono text-sm font-bold text-white tracking-wider flex items-center">
            <span className="text-cyan-400">0{currentRound}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-zinc-400">0{totalRounds}</span>
          </div>
        </div>

        <div className="w-[1px] h-4 bg-zinc-700/80" />

        {/* Mode Selector Button */}
        <button
          onClick={onOpenModes}
          title="Change Sensory Reflex Mode"
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer group"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-zinc-300 group-hover:text-cyan-400">
            {getModeLabel()}
          </span>
          <SlidersHorizontal className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 ml-0.5" />
        </button>
      </div>

      {/* Telemetry Toggles */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio Synthesizer' : 'Enable Audio Synthesizer'}
          className={`flex items-center justify-center w-9 h-9 rounded-full bg-zinc-900/90 border transition-all backdrop-blur-md shadow-lg cursor-pointer ${
            soundEnabled
              ? 'border-zinc-700 text-cyan-400 hover:border-cyan-500'
              : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={onResetSession}
          title="Reset Combine Session"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/60 font-mono text-xs text-zinc-400 hover:text-cyan-300 transition-colors backdrop-blur-md cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RST_ALL</span>
        </button>
      </div>
    </header>
  );
};
