import React from 'react';
import { CommunityStats } from '../types';
import { Activity, Clock, ShieldCheck, MessageSquare, Flame } from 'lucide-react';

interface CommunityStatsBarProps {
  stats: CommunityStats | null;
}

export const CommunityStatsBar: React.FC<CommunityStatsBarProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
      <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            AUTHORITATIVE PLAYTEST TELEMETRY LEDGER
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Avg Performance:</span>
            <span className="font-bold text-emerald-400">{stats.avgFps} FPS ({stats.sixtyFpsRate} @ 60Hz)</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Playtime Logged:</span>
            <span className="font-bold text-cyan-300">{stats.totalPlaytimeMinutes} Minutes</span>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Total Sessions:</span>
            <span className="font-bold text-amber-300">{stats.totalSessions} Verified Runs</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Playtester Notes:</span>
            <span className="font-bold text-purple-300">{stats.totalFeedbackPins} Pinned Entries</span>
          </div>
        </div>
      </div>
    </div>
  );
};
