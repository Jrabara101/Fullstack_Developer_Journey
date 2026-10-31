import React from 'react';
import { Gamepad2, Github, Twitter, Mail, DownloadCloud, Terminal } from 'lucide-react';

interface FooterProps {
  onOpenPassport: () => void;
  xrayMode: boolean;
  onToggleXray: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPassport,
  xrayMode,
  onToggleXray,
}) => {
  return (
    <footer className="w-full bg-[#07090e] border-t border-slate-800/80 pt-12 pb-8 px-4 md:px-8 text-xs font-mono text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 pb-8 border-b border-slate-800/60">
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-2 text-white font-display font-bold text-base tracking-wider">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>NEXUS // GAME ARCHITECT</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Browser-native interactive portfolio, mechanics laboratory, and living dev-log chronicle. Built with React 18, Vite, TypeScript, and Fastify SQLite telemetry engine.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AVAILABLE FOR SENIOR SYSTEMS & LEAD COMBAT ROLES</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <div className="text-white font-bold mb-2">PORTFOLIO</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#games" className="hover:text-cyan-400 transition-colors">Flagship Games</a></li>
              <li><a href="#mechanics-lab" className="hover:text-cyan-400 transition-colors">Mechanics Lab</a></li>
              <li><a href="#devlogs" className="hover:text-cyan-400 transition-colors">Dev-Log Chronicle</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold mb-2">ENGINEERING</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={onToggleXray} className="hover:text-emerald-400 transition-colors text-left">[~] X-Ray Mode: {xrayMode ? 'ON' : 'OFF'}</button></li>
              <li><button onClick={onOpenPassport} className="hover:text-cyan-400 transition-colors text-left">Recruiter Passport</button></li>
              <li><span className="text-slate-500">Fastify / SQLite API</span></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold mb-2">PRESS & CONTACT</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={onOpenPassport} className="hover:text-cyan-400 text-left">Fact Sheet & Kit</button></li>
              <li><a href="mailto:alex.vance.gamedev@nexus.studio" className="hover:text-cyan-400">Email Studio</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400">GitHub Gists</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} Alex Vance. All games, shaders, and kinematic algorithms crafted with care.
        </div>
        <div className="flex items-center gap-4">
          <span>60 FPS Locked Pacing</span>
          <span>•</span>
          <span>Continuous Collision Detection (CCD)</span>
        </div>
      </div>
    </footer>
  );
};
