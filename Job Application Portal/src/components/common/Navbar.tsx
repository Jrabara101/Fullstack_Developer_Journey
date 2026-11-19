import React from 'react';
import { Briefcase, Sun, Moon, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';

interface NavbarProps {
  activeView: 'jobs' | 'apply' | 'track' | 'my-applications' | 'recruiter';
  onNavigate: (view: 'jobs' | 'apply' | 'track' | 'my-applications' | 'recruiter') => void;
  applicationCount?: number;
  slaBreachCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  applicationCount = 2,
  slaBreachCount = 1
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-divider-light dark:border-divider-dark bg-canvas-light/90 dark:bg-canvas-dark/90 backdrop-blur-md px-4 sm:px-8 h-16 flex items-center justify-between transition-colors">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('jobs')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-display font-bold text-sm tracking-tighter">AT</span>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
              Atelier
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Candidate Engine
            </span>
          </div>
        </button>

        {/* View Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-secondary-light dark:bg-surface-secondary-dark p-1 rounded-xl border border-divider-light dark:border-divider-dark">
          <button
            onClick={() => onNavigate('jobs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'jobs'
                ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Explore Jobs
          </button>

          <button
            onClick={() => onNavigate('my-applications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'my-applications' || activeView === 'track'
                ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Applications</span>
            {applicationCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-brand-500/20 text-brand-700 dark:text-brand-300">
                {applicationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('recruiter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'recruiter'
                ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Recruiter Cockpit</span>
            {slaBreachCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                ⚠️ {slaBreachCount} SLA
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center gap-1 bg-surface-secondary-light dark:bg-surface-secondary-dark p-1 rounded-lg border border-divider-light dark:border-divider-dark">
          <button
            onClick={() => onNavigate('jobs')}
            className={`px-2 py-1 rounded text-xs ${activeView === 'jobs' ? 'bg-white dark:bg-slate-800 font-semibold' : 'text-slate-500'}`}
          >
            Jobs
          </button>
          <button
            onClick={() => onNavigate('my-applications')}
            className={`px-2 py-1 rounded text-xs ${activeView === 'my-applications' || activeView === 'track' ? 'bg-white dark:bg-slate-800 font-semibold' : 'text-slate-500'}`}
          >
            Apps ({applicationCount})
          </button>
          <button
            onClick={() => onNavigate('recruiter')}
            className={`px-2 py-1 rounded text-xs ${activeView === 'recruiter' ? 'bg-white dark:bg-slate-800 font-semibold' : 'text-slate-500'}`}
          >
            Recruiter
          </button>
        </div>

        {/* Live SLA Guarantee pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-600 dark:text-slate-400 bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark tabular-nums">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Anti-Ghosting SLA: &le; 5 business days</span>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle light and dark theme"
          className="p-2 rounded-xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shadow-xs"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
