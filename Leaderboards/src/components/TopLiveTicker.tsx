import React from 'react';
import { BracketNode } from '../types/tournament';
import { Radio, Play, Activity, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TopLiveTickerProps {
  liveMatches: BracketNode[];
  allMatches: BracketNode[];
  isConnected: boolean;
  onSelectMatch: (match: BracketNode) => void;
  onSimulateTick: () => void;
  onReset: () => void;
}

export const TopLiveTicker: React.FC<TopLiveTickerProps> = ({
  liveMatches,
  allMatches,
  isConnected,
  onSelectMatch,
  onSimulateTick,
  onReset,
}) => {
  const disputedMatches = allMatches.filter(m => m.status === 'DISPUTED');

  return (
    <header className="sticky top-0 z-50 h-[44px] bg-[#0C101A]/95 backdrop-blur-md border-b border-[#1E283D] flex items-center px-4 justify-between text-xs select-none">
      {/* Left: Broadcast Brand & WS Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 pr-3 border-r border-[#1E283D]">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="font-mono font-bold tracking-wider text-slate-300 uppercase">
            {isConnected ? 'BROADCAST FEED // LIVE' : 'SYNCING FEED...'}
          </span>
        </div>

        {/* Dispute notification bar if any */}
        {disputedMatches.length > 0 && (
          <button
            onClick={() => onSelectMatch(disputedMatches[0])}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-medium hover:bg-amber-500/25 transition-colors animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DISPUTE PENDING ({disputedMatches.length})</span>
          </button>
        )}
      </div>

      {/* Middle: Horizontal Ticker of Live Matches */}
      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 px-4 mask-edges">
        {liveMatches.length > 0 ? (
          liveMatches.map((m) => {
            const activeMap = m.maps.find(map => map.status === 'IN_PROGRESS') || m.maps[0];
            return (
              <button
                key={m.id}
                onClick={() => onSelectMatch(m)}
                className="group flex items-center gap-2.5 px-3 py-1 rounded-md bg-[#131926] hover:bg-[#1C2436] border border-[#1E283D] hover:border-[#38BDF8] transition-all shrink-0 cursor-pointer text-left"
              >
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                  LIVE
                </span>

                <div className="flex items-center gap-1.5 font-display font-semibold text-slate-200">
                  <span className="text-[#38BDF8]">{m.team1.team?.tag || 'TBD'}</span>
                  <span className="font-mono text-white bg-slate-800/80 px-1.5 py-0.2 rounded font-bold">
                    {m.team1.score} : {m.team2.score}
                  </span>
                  <span className="text-slate-400">{m.team2.team?.tag || 'TBD'}</span>
                </div>

                {activeMap && (
                  <span className="font-mono text-[11px] text-slate-400 border-l border-slate-700/60 pl-2">
                    {activeMap.mapName} ({activeMap.score1}-{activeMap.score2})
                  </span>
                )}

                <span className="text-[10px] font-mono text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  WATCH &rarr;
                </span>
              </button>
            );
          })
        ) : (
          <div className="text-slate-500 font-mono flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-slate-600 animate-spin" />
            <span>ALL ROUND 1 MATCHES CONCLUDED • AWAITING STAGE 2 CALLOUT</span>
          </div>
        )}
      </div>

      {/* Right: Simulation & Quick Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSimulateTick}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-95"
          title="Simulate real-time score tick, round progression, or match advancement"
        >
          <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
          <span>SIMULATE TICK</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-[11px] font-mono transition-colors"
          title="Reset tournament bracket to default state"
        >
          <span>RESET</span>
        </button>
      </div>
    </header>
  );
};
