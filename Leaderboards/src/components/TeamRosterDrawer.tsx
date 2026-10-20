import React, { useState } from 'react';
import { TeamEntity } from '../types/tournament';
import { X, Users, Search, Shield, Crosshair, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface TeamRosterDrawerProps {
  isOpen: boolean;
  teams: TeamEntity[];
  selectedTeamId: string | null;
  onClose: () => void;
  onSelectTeamForTracking: (teamId: string) => void;
}

export const TeamRosterDrawer: React.FC<TeamRosterDrawerProps> = ({
  isOpen,
  teams,
  selectedTeamId,
  onClose,
  onSelectTeamForTracking,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.roster.some(p => p.handle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion = regionFilter === 'ALL' || team.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl h-full bg-[#0C101A] border-l border-[#1E283D] flex flex-col shadow-2xl animate-slideLeft cursor-default"
      >
        {/* Header */}
        <div className="p-6 bg-[#131926] border-b border-[#1E283D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                TEAM ROSTERS & PROFILES
              </h3>
              <p className="text-xs font-mono text-slate-400">
                16 Qualified Tier-1 Franchises • Tokyo Masters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-[#07090E] border-b border-[#1E283D] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by team tag, team name, or player handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#131926] border border-[#1E283D] text-xs font-mono text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[11px]">
            {['ALL', 'Americas', 'EMEA', 'Pacific', 'China'].map((reg) => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={cn(
                  'px-3 py-1 rounded-md font-semibold transition-colors shrink-0',
                  regionFilter === reg
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-[#131926]'
                )}
              >
                {reg.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Team Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredTeams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            return (
              <div
                key={team.id}
                className={cn(
                  'rounded-xl bg-[#131926] border transition-all p-4 space-y-3',
                  isSelected ? 'border-[#38BDF8] ring-1 ring-[#38BDF8]' : 'border-[#1E283D] hover:border-slate-700'
                )}
              >
                {/* Team Summary Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400">
                          SEED #{team.seed}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {team.region}
                        </span>
                      </div>
                      <h4 className="font-display font-extrabold text-base text-white">
                        {team.name} <span className="text-slate-400 text-sm font-normal">({team.tag})</span>
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTeamForTracking(team.id);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TRACK ROUTE</span>
                  </button>
                </div>

                {/* Team Stats Pill */}
                {team.stats && (
                  <div className="flex items-center gap-4 bg-[#0C101A] px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>
                      Series W-L: <strong className="text-emerald-400">{team.stats.matchesWon}W - {team.stats.matchesLost}L</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Maps: <strong className="text-slate-200">{team.stats.mapsWon}W - {team.stats.mapsLost}L</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Captain: <strong className="text-slate-200">{team.captainName}</strong>
                    </span>
                  </div>
                )}

                {/* 5-Man Roster Grid */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    ACTIVE 5-MAN ROSTER
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {team.roster.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 bg-[#0C101A]/70 px-2.5 py-1.5 rounded border border-slate-800/80"
                      >
                        <img
                          src={player.avatar}
                          alt={player.handle}
                          className="w-6 h-6 rounded-full bg-slate-800"
                        />
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-xs text-slate-200">
                              {player.handle}
                            </span>
                            {player.id === team.captainId && (
                              <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1 rounded">
                                IGL
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block truncate">
                            {player.role} • {player.country}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
