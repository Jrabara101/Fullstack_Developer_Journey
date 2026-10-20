import React from 'react';
import { TournamentState } from '../types/tournament';
import { Trophy, Shield, Users, Calendar, Sparkles, Layers, SlidersHorizontal, Radio } from 'lucide-react';

interface TournamentHeroProps {
  tournament: TournamentState;
  activeTab: 'bracket' | 'schedule' | 'teams' | 'admin';
  onTabChange: (tab: 'bracket' | 'schedule' | 'teams' | 'admin') => void;
  onOpenRosterDrawer: () => void;
}

export const TournamentHero: React.FC<TournamentHeroProps> = ({
  tournament,
  activeTab,
  onTabChange,
  onOpenRosterDrawer
}) => {
  const completedMatches = tournament.bracketNodes.filter(m => m.status === 'COMPLETED').length;
  const liveCount = tournament.bracketNodes.filter(m => m.status === 'LIVE').length;
  const totalMatches = tournament.bracketNodes.length;

  return (
    <div className="relative border-b border-[#1E283D] bg-gradient-to-b from-[#0C101A] to-[#07090E] px-4 md:px-8 pt-6 pb-2">
      {/* Subtle stadium underglow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        {/* Left: Tournament Identity & Title */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest font-bold">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              VALORANT TIER-1 GLOBAL MAJOR
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              PRIZE POOL: {tournament.prizePool}
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 font-medium">
              DOUBLE ELIMINATION • 16 TEAMS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              {tournament.title}
            </span>
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 rounded-md">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                {liveCount} LIVE
              </span>
            )}
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>STAGE: <strong className="text-slate-200">{tournament.currentStage}</strong></span>
            <span>•</span>
            <span>COMPLETED: <strong className="text-emerald-400">{completedMatches}/{totalMatches}</strong> MATCHES</span>
            <span>•</span>
            <span>VENUE: <span className="text-slate-300">Makuhari Messe Arena, Chiba JP</span></span>
          </div>
        </div>

        {/* Right: Quick Team Rosters Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenRosterDrawer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#131926] hover:bg-[#1C2436] border border-[#1E283D] hover:border-[#38BDF8] text-slate-200 font-mono text-xs transition-all shadow-lg group"
          >
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>VIEW ALL 16 ROSTERS</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-6 flex items-center justify-between border-t border-[#1E283D] pt-2">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('bracket')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-display font-semibold border-b-2 transition-all ${
              activeTab === 'bracket'
                ? 'border-[#38BDF8] text-[#38BDF8] bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>INTERACTIVE BRACKET</span>
          </button>

          <button
            onClick={() => onTabChange('schedule')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-display font-semibold border-b-2 transition-all ${
              activeTab === 'schedule'
                ? 'border-[#38BDF8] text-[#38BDF8] bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>SCHEDULE & RESULTS</span>
          </button>

          <button
            onClick={() => onTabChange('teams')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-display font-semibold border-b-2 transition-all ${
              activeTab === 'teams'
                ? 'border-[#38BDF8] text-[#38BDF8] bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>TEAM ROSTERS & STATS</span>
          </button>

          <button
            onClick={() => onTabChange('admin')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-display font-semibold border-b-2 transition-all ${
              activeTab === 'admin'
                ? 'border-[#38BDF8] text-[#38BDF8] bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>CAPTAIN REPORT & ADMIN DESK</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
