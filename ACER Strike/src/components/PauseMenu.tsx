import React from 'react';
import { Home, Pause, Play, Settings as SettingsIcon } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onOpenSettings,
  onQuitToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-[65] flex items-center justify-center bg-slate-950/80 p-4 font-mono backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-400">
            <Pause className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-widest text-slate-100">Paused</h2>
            <p className="text-[11px] text-slate-500">Match is frozen</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-950 transition-colors hover:bg-amber-400"
          >
            <Play className="h-4 w-4 fill-current" /> Resume
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-colors hover:bg-slate-700"
          >
            <SettingsIcon className="h-4 w-4" /> Settings
          </button>
          <button
            onClick={onQuitToMenu}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:border-rose-800 hover:text-rose-400"
          >
            <Home className="h-4 w-4" /> Quit to menu
          </button>
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-widest text-slate-600">
          Press Esc to resume
        </p>
      </div>
    </div>
  );
};
