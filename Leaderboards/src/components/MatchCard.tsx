import React from 'react';
import { BracketNode, TeamEntity } from '../types/tournament';
import { Radio, AlertTriangle, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface MatchCardProps {
  match: BracketNode;
  isHovered: boolean;
  isDimmed: boolean;
  highlightedTeamId: string | null;
  onSelect: (match: BracketNode) => void;
  onHoverTeam: (teamId: string | null) => void;
  onQuickScore?: (teamSlot: 1 | 2) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isHovered,
  isDimmed,
  highlightedTeamId,
  onSelect,
  onHoverTeam,
  onQuickScore,
}) => {
  const isLive = match.status === 'LIVE';
  const isDisputed = match.status === 'DISPUTED';
  const isCompleted = match.status === 'COMPLETED';
  const isReady = match.status === 'READY';

  const team1Won = isCompleted && match.winnerId === match.team1.team?.id;
  const team2Won = isCompleted && match.winnerId === match.team2.team?.id;

  const isTeam1Highlighted = highlightedTeamId && match.team1.team?.id === highlightedTeamId;
  const isTeam2Highlighted = highlightedTeamId && match.team2.team?.id === highlightedTeamId;

  // Recent score flare detection (within last 1.2s)
  const hasRecentFlare = match.liveFlareTimestamp && (Date.now() - match.liveFlareTimestamp < 1200);

  return (
    <div
      onClick={() => onSelect(match)}
      className={cn(
        'relative w-[240px] h-[86px] rounded-lg bg-[#131926] border transition-all duration-200 select-none cursor-pointer flex flex-col justify-between overflow-hidden group',
        isDimmed && 'opacity-25 hover:opacity-100',
        !isDimmed && 'opacity-100',
        isDisputed
          ? 'border-amber-500 animate-dispute-flash shadow-[0_0_14px_rgba(245,158,11,0.3)]'
          : isLive
          ? 'border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          : isHovered
          ? 'border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.3)]'
          : 'border-[#1E283D] hover:border-slate-600'
      )}
    >
      {/* Top micro status bar */}
      <div className="h-[20px] bg-[#0C101A] px-2.5 flex items-center justify-between border-b border-[#1E283D] text-[10px] font-mono">
        <span className="text-slate-400 font-semibold truncate max-w-[120px]">
          {match.stageName}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold">BO{match.bestOf}</span>

          {isLive && (
            <span className="flex items-center gap-1 text-red-400 font-bold tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
              LIVE
            </span>
          )}

          {isDisputed && (
            <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/20 px-1 rounded">
              <AlertTriangle className="w-2.5 h-2.5" />
              REVIEW
            </span>
          )}

          {isCompleted && (
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle className="w-2.5 h-2.5" />
              FINAL
            </span>
          )}

          {isReady && (
            <span className="text-cyan-400 font-bold">
              READY
            </span>
          )}

          {match.status === 'SCHEDULED' && (
            <span className="text-slate-500">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Team 1 Slot Row */}
      <div
        onMouseEnter={() => match.team1.team && onHoverTeam(match.team1.team.id)}
        onMouseLeave={() => onHoverTeam(null)}
        className={cn(
          'flex-1 flex items-center justify-between px-2.5 border-b border-[#1E283D]/60 transition-colors',
          isTeam1Highlighted && 'bg-cyan-500/10 font-bold',
          team1Won && 'bg-emerald-500/5',
          !match.team1.team && 'text-slate-500'
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {match.team1.team ? (
            <>
              <span className="font-mono text-[10px] text-slate-500 w-4 text-center shrink-0">
                #{match.team1.team.seed}
              </span>
              <img
                src={match.team1.team.logo}
                alt={match.team1.team.tag}
                className="w-5 h-5 rounded object-cover border border-slate-700 shrink-0"
              />
              <span className={cn(
                'font-display text-xs truncate',
                team1Won ? 'text-emerald-300 font-bold' : 'text-slate-200 font-semibold',
                isTeam1Highlighted && 'text-cyan-300'
              )}>
                {match.team1.team.tag}
              </span>
            </>
          ) : (
            <span className="text-xs font-mono text-slate-500 italic">TBD</span>
          )}
        </div>

        {/* Score block */}
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'w-7 h-5 flex items-center justify-center font-mono text-xs font-bold rounded',
              hasRecentFlare && 'animate-score-flare',
              team1Won
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : match.team1.score > 0
                ? 'bg-slate-800 text-slate-200'
                : 'bg-[#0C101A] text-slate-500'
            )}
          >
            {match.team1.score}
          </span>
        </div>
      </div>

      {/* Team 2 Slot Row */}
      <div
        onMouseEnter={() => match.team2.team && onHoverTeam(match.team2.team.id)}
        onMouseLeave={() => onHoverTeam(null)}
        className={cn(
          'flex-1 flex items-center justify-between px-2.5 transition-colors',
          isTeam2Highlighted && 'bg-cyan-500/10 font-bold',
          team2Won && 'bg-emerald-500/5',
          !match.team2.team && 'text-slate-500'
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {match.team2.team ? (
            <>
              <span className="font-mono text-[10px] text-slate-500 w-4 text-center shrink-0">
                #{match.team2.team.seed}
              </span>
              <img
                src={match.team2.team.logo}
                alt={match.team2.team.tag}
                className="w-5 h-5 rounded object-cover border border-slate-700 shrink-0"
              />
              <span className={cn(
                'font-display text-xs truncate',
                team2Won ? 'text-emerald-300 font-bold' : 'text-slate-200 font-semibold',
                isTeam2Highlighted && 'text-cyan-300'
              )}>
                {match.team2.team.tag}
              </span>
            </>
          ) : (
            <span className="text-xs font-mono text-slate-500 italic">TBD</span>
          )}
        </div>

        {/* Score block */}
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'w-7 h-5 flex items-center justify-center font-mono text-xs font-bold rounded',
              hasRecentFlare && 'animate-score-flare',
              team2Won
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : match.team2.score > 0
                ? 'bg-slate-800 text-slate-200'
                : 'bg-[#0C101A] text-slate-500'
            )}
          >
            {match.team2.score}
          </span>
        </div>
      </div>

      {/* Hover prompt hint */}
      <div className="absolute right-1 top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
      </div>
    </div>
  );
};
