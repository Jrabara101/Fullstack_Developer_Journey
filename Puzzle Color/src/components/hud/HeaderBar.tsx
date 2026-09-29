import React from 'react';
import {
  FlaskConical,
  Sun,
  Eye,
  Activity,
  Trophy,
  Swords,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ColorModel } from '../../types/color';

interface HeaderBarProps {
  mode: ColorModel;
  onSwitchMode: (mode: ColorModel) => void;
  puzzleId: string;
  onOpenInspector: () => void;
  onOpenAccessibility: () => void;
  onOpenLeaderboard: () => void;
  onOpenDuel: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  mode,
  onSwitchMode,
  puzzleId,
  onOpenInspector,
  onOpenAccessibility,
  onOpenLeaderboard,
  onOpenDuel,
  audioMuted,
  onToggleAudio,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-surface-high/60 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-magenta-500 to-yellow-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-tight text-white uppercase">
                ChromaLab
              </span>
              <span className="font-mono text-[9px] uppercase font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30">
                ISO-3
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              Spectrophotometric Studio
            </span>
          </div>
        </div>

        {/* Dual Physics Mode Switch (Pigment vs Light) */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-surface-lowest border border-surface-container shadow-inner">
          <button
            onClick={() => onSwitchMode('SUBTRACTIVE_CMYK')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'SUBTRACTIVE_CMYK'
                ? 'bg-surface-high text-primary shadow-sm border border-surface-bright/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Subtractive Pigment</span>
          </button>
          <button
            onClick={() => onSwitchMode('ADDITIVE_RGB')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'ADDITIVE_RGB'
                ? 'bg-surface-high text-amber-400 shadow-sm border border-surface-bright/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Additive Light</span>
          </button>
        </div>

        {/* Right Action Icons Bar */}
        <div className="flex items-center gap-1.5">
          {/* Audio toggle */}
          <button
            onClick={onToggleAudio}
            className="w-9 h-9 rounded-xl bg-surface-low border border-surface-high/60 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95"
            title={audioMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* 1v1 Duel Mode */}
          <button
            onClick={onOpenDuel}
            className="w-9 h-9 rounded-xl bg-surface-low border border-surface-high/60 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all active:scale-95"
            title="1v1 Color Clash Duel"
          >
            <Swords className="w-4 h-4" />
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="w-9 h-9 rounded-xl bg-surface-low border border-surface-high/60 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all active:scale-95"
            title="High Scores Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Chemical Inspector Drawer */}
          <button
            onClick={onOpenInspector}
            className="w-9 h-9 rounded-xl bg-surface-low border border-surface-high/60 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all active:scale-95"
            title="Open CIELAB & Chemical Telemetry Sheet"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Daltonization Accessibility Popover */}
          <button
            onClick={onOpenAccessibility}
            className="w-9 h-9 rounded-xl bg-surface-low border border-surface-high/60 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all active:scale-95"
            title="Colorblind Filters & Tactile Pattern Anchors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
