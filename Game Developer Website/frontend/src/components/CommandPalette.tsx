import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { GameProject, DevLogEntry } from '../types';
import { 
  Search, 
  Gamepad2, 
  Sparkles, 
  FileText, 
  Eye, 
  DownloadCloud, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GameProject[];
  devlogs: DevLogEntry[];
  onSelectProject: (project: GameProject) => void;
  onLaunchDemo: (project: GameProject) => void;
  onToggleXray: () => void;
  onOpenPassport: () => void;
  onNavigateSection: (section: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  devlogs,
  onSelectProject,
  onLaunchDemo,
  onToggleXray,
  onOpenPassport,
  onNavigateSection,
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-[#0d111a] border border-cyan-500/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <Command className="w-full font-mono text-xs">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search games, mechanics, devlogs, or hotkeys... (Esc to exit)"
              className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none text-xs"
            />
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
              ESC
            </kbd>
          </div>

          {/* List Options */}
          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="p-4 text-center text-slate-500">
              No matching commands or projects found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="QUICK COMMANDS" className="text-[10px] text-slate-500 px-2 py-1 font-bold">
              <Command.Item
                onSelect={() => {
                  onToggleXray();
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Toggle [X-Ray Debug Mode]</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[10px]">~</kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenPassport();
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-cyan-400" />
                  <span>Open Recruiter & Publisher Passport</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Command.Item>
            </Command.Group>

            {/* Game Projects */}
            <Command.Group heading="GAMES & PLAYABLE SLICES" className="text-[10px] text-slate-500 px-2 py-1 font-bold">
              {projects.map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => {
                    onLaunchDemo(p);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                    <span>{p.title}</span>
                    <span className="text-[10px] text-slate-500">({p.engine})</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">▶ Launch Demo</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* DevLogs */}
            <Command.Group heading="DEV-LOGS & BENCHMARKS" className="text-[10px] text-slate-500 px-2 py-1 font-bold">
              {devlogs.map((d) => (
                <Command.Item
                  key={d.id}
                  onSelect={() => {
                    onNavigateSection('devlogs');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300 hover:text-white"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-purple-300 font-bold shrink-0">{d.versionTag}:</span>
                    <span className="truncate">{d.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{d.readingTimeMinutes}m</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Sections */}
            <Command.Group heading="NAVIGATION" className="text-[10px] text-slate-500 px-2 py-1 font-bold">
              <Command.Item
                onSelect={() => {
                  onNavigateSection('lab');
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300 hover:text-white"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Jump to Mechanic Dissector Lab</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  onNavigateSection('games');
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300 hover:text-white"
              >
                <Flame className="w-4 h-4 text-cyan-400" />
                <span>Jump to Flagship Games Dossier</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
