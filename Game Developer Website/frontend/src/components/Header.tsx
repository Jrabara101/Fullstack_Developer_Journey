import React from 'react';
import { 
  Gamepad2, 
  Terminal, 
  Search, 
  Eye, 
  FileText, 
  Sparkles, 
  Flame,
  DownloadCloud
} from 'lucide-react';

interface HeaderProps {
  xrayMode: boolean;
  onToggleXray: () => void;
  onOpenCommand: () => void;
  onOpenPassport: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  xrayMode,
  onToggleXray,
  onOpenCommand,
  onOpenPassport,
  activeSection,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-[#090b10]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between transition-all">
      {/* Brand Identity & Availability */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base tracking-wider text-white group-hover:text-cyan-400 transition-colors">
                NEXUS
              </span>
              <span className="text-slate-600 font-mono text-xs">//</span>
              <span className="font-mono text-xs text-slate-400 hidden sm:inline">STUDIO ARCHITECT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-tight text-emerald-400 uppercase font-semibold">
                Open For Roles / Contracts
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60 text-xs font-mono">
        <button
          onClick={() => onNavigate('games')}
          className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSection === 'games'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-cyan-400" />
          Flagship Games
        </button>
        <button
          onClick={() => onNavigate('lab')}
          className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSection === 'lab'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Mechanics Lab
        </button>
        <button
          onClick={() => onNavigate('devlogs')}
          className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSection === 'devlogs'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          Dev-Log Chronicle
        </button>
      </nav>

      {/* Right Controls: Search, X-Ray Switch, Recruiter Passport */}
      <div className="flex items-center gap-3">
        {/* Cmd + K Command Trigger */}
        <button
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-lg text-xs font-mono text-slate-300 transition-all shadow-inner"
          title="Open Command Search (Ctrl+K or Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search Dossier</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Global [X-RAY DEBUG MODE] Toggle Switch */}
        <button
          onClick={onToggleXray}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
            xrayMode
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
          }`}
          title="Toggle Global X-Ray Debug Layer (Hotkey: [~])"
        >
          <Eye className={`w-3.5 h-3.5 ${xrayMode ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden md:inline font-semibold">X-RAY DEBUG</span>
          <kbd className={`px-1 py-0.5 rounded text-[10px] font-mono ${xrayMode ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}>
            ~
          </kbd>
          <span className={`w-2 h-2 rounded-full ${xrayMode ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`}></span>
        </button>

        {/* Recruiter / Publisher Passport Button */}
        <button
          onClick={onOpenPassport}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs rounded-lg shadow-md shadow-cyan-500/20 transition-all transform active:scale-95"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-black" />
          <span className="hidden sm:inline">Recruiter Passport</span>
          <span className="sm:hidden">Passport</span>
        </button>
      </div>
    </header>
  );
};
