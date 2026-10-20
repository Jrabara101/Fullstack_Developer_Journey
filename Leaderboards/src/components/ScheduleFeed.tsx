import React, { useState, useMemo } from 'react';
import { BracketNode } from '../types/tournament';
import { Calendar, Filter, Clock, Play, CheckCircle, AlertTriangle, ChevronRight, Search } from 'lucide-react';
import { cn, formatUtcTime } from '../lib/utils';

interface ScheduleFeedProps {
  matches: BracketNode[];
  onSelectMatch: (match: BracketNode) => void;
  onOpenTeamRoster: (teamId: string) => void;
}

export const ScheduleFeed: React.FC<ScheduleFeedProps> = ({
  matches,
  onSelectMatch,
  onOpenTeamRoster,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'COMPLETED' | 'SCHEDULED' | 'DISPUTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Group matches by Date header
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'LIVE' && m.status === 'LIVE') ||
        (statusFilter === 'COMPLETED' && m.status === 'COMPLETED') ||
        (statusFilter === 'DISPUTED' && m.status === 'DISPUTED') ||
        (statusFilter === 'SCHEDULED' && (m.status === 'SCHEDULED' || m.status === 'READY'));

      const t1 = m.team1.team;
      const t2 = m.team2.team;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        m.stageName.toLowerCase().includes(q) ||
        (t1 && (t1.name.toLowerCase().includes(q) || t1.tag.toLowerCase().includes(q))) ||
        (t2 && (t2.name.toLowerCase().includes(q) || t2.tag.toLowerCase().includes(q)));

      return matchesStatus && matchesSearch;
    });
  }, [matches, statusFilter, searchQuery]);

  // Group by Date
  const groupedMatches = useMemo(() => {
    const groups: { [dateStr: string]: BracketNode[] } = {};

    filteredMatches.forEach(match => {
      const d = new Date(match.scheduledTimeUtc);
      let dateKey = 'SCHEDULED UPCOMING';
      if (!isNaN(d.getTime())) {
        dateKey = d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase();
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(match);
    });

    return groups;
  }, [filteredMatches]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Filtering Toolbar */}
      <div className="bg-[#131926] border border-[#1E283D] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            FILTER STATUS:
          </span>

          {(['ALL', 'LIVE', 'SCHEDULED', 'COMPLETED', 'DISPUTED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-mono font-bold transition-all',
                statusFilter === status
                  ? 'bg-[#38BDF8] text-black shadow-md'
                  : 'bg-[#0C101A] text-slate-400 hover:text-white border border-[#1E283D]'
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search teams or stages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0C101A] border border-[#1E283D] text-xs font-mono text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Grouped Match Feed */}
      <div className="space-y-8">
        {Object.keys(groupedMatches).length === 0 ? (
          <div className="bg-[#131926] border border-[#1E283D] rounded-xl p-12 text-center text-slate-500 font-mono">
            No matches found matching filter criteria.
          </div>
        ) : (
          Object.entries(groupedMatches).map(([dateHeader, dateMatches]) => (
            <div key={dateHeader} className="space-y-3">
              {/* Date Header Segment */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-4 bg-cyan-400 rounded-sm"></div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-200 tracking-wider">
                  {dateHeader}
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  ({dateMatches.length} Matches)
                </span>
              </div>

              {/* Match Rows Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dateMatches.map((match) => {
                  const t1 = match.team1.team;
                  const t2 = match.team2.team;
                  const time = formatUtcTime(match.scheduledTimeUtc);
                  const isLive = match.status === 'LIVE';
                  const isCompleted = match.status === 'COMPLETED';
                  const isDisputed = match.status === 'DISPUTED';

                  return (
                    <div
                      key={match.id}
                      onClick={() => onSelectMatch(match)}
                      className={cn(
                        'p-4 rounded-xl bg-[#131926] border transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.01]',
                        isLive
                          ? 'border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : isDisputed
                          ? 'border-amber-500 animate-pulse'
                          : 'border-[#1E283D] hover:border-[#38BDF8]'
                      )}
                    >
                      {/* Top Row: Stage & Status */}
                      <div className="flex items-center justify-between text-xs font-mono mb-3">
                        <span className="text-slate-400 font-bold truncate">
                          {match.stageName} • BO{match.bestOf}
                        </span>

                        <div className="flex items-center gap-2">
                          {isLive && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              LIVE NOW
                            </span>
                          )}
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3" />
                              FINAL
                            </span>
                          )}
                          {isDisputed && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              DISPUTE
                            </span>
                          )}
                          {!isLive && !isCompleted && !isDisputed && (
                            <span className="text-slate-500">
                              {time.local}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Head-to-Head matchup */}
                      <div className="space-y-2">
                        {/* Team 1 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {t1 ? (
                              <>
                                <span className="text-[10px] font-mono text-slate-500 w-5">
                                  #{t1.seed}
                                </span>
                                <img
                                  src={t1.logo}
                                  alt={t1.tag}
                                  className="w-6 h-6 rounded object-cover border border-slate-700"
                                />
                                <span className={cn(
                                  'font-display font-bold text-sm truncate',
                                  match.winnerId === t1.id ? 'text-emerald-400' : 'text-slate-200'
                                )}>
                                  {t1.name}
                                </span>
                              </>
                            ) : (
                              <span className="font-mono text-sm text-slate-500 italic">TBD</span>
                            )}
                          </div>

                          <span className={cn(
                            'font-mono text-sm font-black px-2 py-0.5 rounded',
                            match.winnerId === t1?.id
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-[#0C101A] text-slate-400'
                          )}>
                            {match.team1.score}
                          </span>
                        </div>

                        {/* Team 2 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {t2 ? (
                              <>
                                <span className="text-[10px] font-mono text-slate-500 w-5">
                                  #{t2.seed}
                                </span>
                                <img
                                  src={t2.logo}
                                  alt={t2.tag}
                                  className="w-6 h-6 rounded object-cover border border-slate-700"
                                />
                                <span className={cn(
                                  'font-display font-bold text-sm truncate',
                                  match.winnerId === t2.id ? 'text-emerald-400' : 'text-slate-200'
                                )}>
                                  {t2.name}
                                </span>
                              </>
                            ) : (
                              <span className="font-mono text-sm text-slate-500 italic">TBD</span>
                            )}
                          </div>

                          <span className={cn(
                            'font-mono text-sm font-black px-2 py-0.5 rounded',
                            match.winnerId === t2?.id
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-[#0C101A] text-slate-400'
                          )}>
                            {match.team2.score}
                          </span>
                        </div>
                      </div>

                      {/* Bottom action trigger */}
                      <div className="mt-3 pt-2 border-t border-[#1E283D] flex items-center justify-between text-xs font-mono text-slate-500">
                        <span>{time.utc}</span>
                        <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                          MATCH TELEMETRY &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
