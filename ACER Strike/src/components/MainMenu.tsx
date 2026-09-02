import React from 'react';
import { Crosshair, Play, Settings as SettingsIcon, Shield, Target } from 'lucide-react';
import { Team } from '../types/game';

interface MainMenuProps {
  onStart: (team: Team) => void;
  onOpenSettings: () => void;
}

const CONTROLS: { keys: string; action: string; accent: string }[] = [
  { keys: 'WASD', action: 'Move — release to counter-strafe', accent: 'text-amber-400' },
  { keys: 'Shift / Ctrl', action: 'Walk silently / crouch', accent: 'text-slate-200' },
  { keys: 'Mouse 1', action: 'Fire', accent: 'text-rose-400' },
  { keys: 'V / Mouse 3', action: 'Swap shoulder', accent: 'text-sky-400' },
  { keys: 'R', action: 'Reload', accent: 'text-slate-200' },
  { keys: 'Hold E', action: 'Plant or defuse C4', accent: 'text-rose-400' },
  { keys: 'B', action: 'Buy menu', accent: 'text-emerald-400' },
  { keys: 'Esc', action: 'Pause', accent: 'text-slate-200' },
];

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onOpenSettings }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950 p-4 font-mono">
      {/* Ambient hazard glow, echoing the bombsite decal */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,149,0,0.10),transparent_65%)]" />

      <div className="relative w-full max-w-3xl">
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-400">
            <Crosshair className="h-8 w-8" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-[0.2em] text-slate-100 sm:text-6xl">
            ACER Strike
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Round-based tactical shooter · Counter-strafing · Spray patterns · Bomb defusal
          </p>
        </div>

        {/* Side selection */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onStart('CT')}
            className="group rounded-2xl border border-sky-800/70 bg-slate-900/80 p-5 text-left transition-all hover:border-sky-500/70 hover:bg-slate-900"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-700/60 bg-sky-950 text-sky-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-sky-300">
                  Counter-Terrorists
                </div>
                <div className="text-[11px] text-slate-500">Defend the site</div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Hold angles, deny the plant, and defuse. Spawns with an M4A1 and a defuse kit.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-400 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="h-3.5 w-3.5 fill-current" /> Deploy
            </div>
          </button>

          <button
            onClick={() => onStart('T')}
            className="group rounded-2xl border border-amber-800/70 bg-slate-900/80 p-5 text-left transition-all hover:border-amber-500/70 hover:bg-slate-900"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-700/60 bg-amber-950 text-amber-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-amber-300">
                  Terrorists
                </div>
                <div className="text-[11px] text-slate-500">Plant the bomb</div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Take the site, plant the C4, and hold the retake. Spawns with an AK-47 and the bomb.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-400 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="h-3.5 w-3.5 fill-current" /> Deploy
            </div>
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-colors hover:bg-slate-800"
        >
          <SettingsIcon className="h-4 w-4" /> Settings
        </button>

        {/* Controls reference */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Controls
          </h2>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {CONTROLS.map((c) => (
              <div key={c.keys} className="flex items-baseline justify-between gap-3 text-[11px]">
                <span className="text-slate-400">{c.action}</span>
                <span className={`whitespace-nowrap font-bold ${c.accent}`}>{c.keys}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-widest text-slate-600">
          First to 8 rounds · Sides swap at round 8
        </p>
      </div>
    </div>
  );
};
