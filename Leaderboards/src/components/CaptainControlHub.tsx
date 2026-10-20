import React, { useState } from 'react';
import { TournamentState, BracketNode, CaptainReport } from '../types/tournament';
import { Shield, AlertTriangle, CheckCircle, Play, RotateCcw, Flag, Radio, MessageSquare, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface CaptainControlHubProps {
  tournament: TournamentState;
  onIncrementScore: (matchId: string, teamSlot: 1 | 2) => void;
  onSubmitReport: (matchId: string, report: CaptainReport) => void;
  onResolveDispute: (matchId: string, winnerId: string, score1: number, score2: number, adminNotes?: string) => void;
  onSimulateTick: () => void;
  onReset: () => void;
  onSelectMatch: (match: BracketNode) => void;
}

export const CaptainControlHub: React.FC<CaptainControlHubProps> = ({
  tournament,
  onIncrementScore,
  onSubmitReport,
  onResolveDispute,
  onSimulateTick,
  onReset,
  onSelectMatch,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    tournament.activeLiveMatches[0] || tournament.bracketNodes[0]?.id || ''
  );

  const selectedMatch = tournament.bracketNodes.find(m => m.id === selectedMatchId);
  const disputedMatches = tournament.bracketNodes.filter(m => m.status === 'DISPUTED');
  const liveMatches = tournament.bracketNodes.filter(m => m.status === 'LIVE');

  const t1 = selectedMatch?.team1.team;
  const t2 = selectedMatch?.team2.team;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Admin Telemetry Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#131926] border border-[#1E283D] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">LIVE MATCHES</span>
            <h4 className="text-2xl font-mono font-bold text-red-400">{liveMatches.length}</h4>
          </div>
          <Radio className="w-8 h-8 text-red-500/40" />
        </div>

        <div className="p-4 rounded-xl bg-[#131926] border border-[#1E283D] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">PENDING DISPUTES</span>
            <h4 className="text-2xl font-mono font-bold text-amber-400">{disputedMatches.length}</h4>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="p-4 rounded-xl bg-[#131926] border border-[#1E283D] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">TOTAL MATCHES</span>
            <h4 className="text-2xl font-mono font-bold text-cyan-400">{tournament.bracketNodes.length}</h4>
          </div>
          <Flag className="w-8 h-8 text-cyan-500/40" />
        </div>

        <div className="p-4 rounded-xl bg-[#131926] border border-[#1E283D] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">ACTIVE FORMAT</span>
            <h4 className="text-sm font-mono font-bold text-emerald-400">DOUBLE ELIMINATION</h4>
          </div>
          <Shield className="w-8 h-8 text-emerald-500/40" />
        </div>
      </div>

      {/* Quick Action Simulation Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#131926] to-[#0C101A] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white">
              AUTONOMOUS BROADCAST SIMULATOR
            </h4>
            <p className="text-xs font-mono text-slate-400">
              Advance round scores, simulate captain consensus, and trigger real-time WebSockets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSimulateTick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-cyan-300 text-black font-mono font-bold text-xs transition-transform active:scale-95 shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>TRIGGER LIVE TICK</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TOURNAMENT</span>
          </button>
        </div>
      </div>

      {/* Active Disputes Section (if any) */}
      {disputedMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>ACTIVE DISPUTES REQUIRING ADMIN RESOLUTION ({disputedMatches.length})</span>
          </div>

          <div className="grid gap-4">
            {disputedMatches.map(match => (
              <div
                key={match.id}
                className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    MATCH: {match.stageName} • {match.team1.team?.name} vs {match.team2.team?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                    ACTION REQUIRED
                  </span>
                </div>

                <p className="text-xs font-mono text-amber-200">
                  {match.disputeReason}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  {match.team1.team && (
                    <button
                      onClick={() => onResolveDispute(match.id, match.team1.team!.id, 2, 1, 'Admin verified server replay')}
                      className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all"
                    >
                      Declare {match.team1.team.name} Winner (2 - 1)
                    </button>
                  )}
                  {match.team2.team && (
                    <button
                      onClick={() => onResolveDispute(match.id, match.team2.team!.id, 1, 2, 'Admin verified server replay')}
                      className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all"
                    >
                      Declare {match.team2.team.name} Winner (2 - 1)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dual Captain Simulation & Match Control Station */}
      <div className="bg-[#131926] border border-[#1E283D] rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E283D] pb-4">
          <div>
            <h3 className="font-display font-extrabold text-lg text-white">
              DUAL-CAPTAIN REPORTING STAGE DESK
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Select any match to submit opposing captain telemetry and observe consensus vs dispute branching
            </p>
          </div>

          {/* Match Selector Dropdown */}
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#0C101A] border border-[#1E283D] text-xs font-mono text-slate-200 outline-none focus:border-cyan-400"
          >
            {tournament.bracketNodes.map(m => (
              <option key={m.id} value={m.id}>
                [{m.status}] {m.stageName}: {m.team1.team?.tag || 'TBD'} vs {m.team2.team?.tag || 'TBD'}
              </option>
            ))}
          </select>
        </div>

        {selectedMatch && (
          <div className="space-y-6">
            {/* Selected Match Card Preview */}
            <div className="p-4 rounded-xl bg-[#0C101A] border border-[#1E283D] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {selectedMatch.stageName} (BO{selectedMatch.bestOf})
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Status: <strong className="text-white">{selectedMatch.status}</strong>
                </span>
                {selectedMatch.winnerId && (
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    WINNER: {tournament.teams.find(t => t.id === selectedMatch.winnerId)?.name}
                  </span>
                )}
              </div>

              <button
                onClick={() => onSelectMatch(selectedMatch)}
                className="px-3 py-1 rounded bg-[#1C2436] hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
              >
                OPEN FULL MODAL
              </button>
            </div>

            {/* Captain 1 and Captain 2 Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Captain 1 */}
              <div className="p-5 rounded-xl bg-[#0C101A] border border-[#1E283D] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <img src={t1?.logo} alt="" className="w-6 h-6 rounded object-cover" />
                    <span className="font-display font-bold text-sm text-white">
                      {t1?.name} ({t1?.tag})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    CAPTAIN: {t1?.captainName}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 block font-semibold">
                    SUBMIT CAPTAIN 1 MATCH REPORT:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => t1 && onSubmitReport(selectedMatch.id, {
                        captainId: t1.captainId,
                        captainName: t1.captainName,
                        teamId: t1.id,
                        reportedWinnerId: t1.id,
                        reportedScore1: 2,
                        reportedScore2: 0,
                        reportedAtUtc: new Date().toISOString()
                      })}
                      className="px-3 py-2 rounded bg-slate-800 hover:bg-cyan-900/50 hover:border-cyan-500/50 border border-slate-700 text-xs font-mono text-slate-200 transition-all text-left"
                    >
                      {t1?.tag} Won 2 - 0
                    </button>
                    <button
                      onClick={() => t1 && onSubmitReport(selectedMatch.id, {
                        captainId: t1.captainId,
                        captainName: t1.captainName,
                        teamId: t1.id,
                        reportedWinnerId: t1.id,
                        reportedScore1: 2,
                        reportedScore2: 1,
                        reportedAtUtc: new Date().toISOString()
                      })}
                      className="px-3 py-2 rounded bg-slate-800 hover:bg-cyan-900/50 hover:border-cyan-500/50 border border-slate-700 text-xs font-mono text-slate-200 transition-all text-left"
                    >
                      {t1?.tag} Won 2 - 1
                    </button>
                  </div>
                </div>

                {/* Score Bump */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Live Score Increment:</span>
                  <button
                    onClick={() => onIncrementScore(selectedMatch.id, 1)}
                    className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-500/30"
                  >
                    +1 {t1?.tag} Round
                  </button>
                </div>
              </div>

              {/* Captain 2 */}
              <div className="p-5 rounded-xl bg-[#0C101A] border border-[#1E283D] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <img src={t2?.logo} alt="" className="w-6 h-6 rounded object-cover" />
                    <span className="font-display font-bold text-sm text-white">
                      {t2?.name} ({t2?.tag})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    CAPTAIN: {t2?.captainName}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 block font-semibold">
                    SUBMIT CAPTAIN 2 MATCH REPORT:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => t2 && onSubmitReport(selectedMatch.id, {
                        captainId: t2.captainId,
                        captainName: t2.captainName,
                        teamId: t2.id,
                        reportedWinnerId: t1 ? t1.id : t2.id,
                        reportedScore1: 2,
                        reportedScore2: 0,
                        reportedAtUtc: new Date().toISOString()
                      })}
                      className="px-3 py-2 rounded bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-mono text-emerald-300 transition-all text-left"
                    >
                      Agree: {t1?.tag} 2-0 Win
                    </button>
                    <button
                      onClick={() => t2 && onSubmitReport(selectedMatch.id, {
                        captainId: t2.captainId,
                        captainName: t2.captainName,
                        teamId: t2.id,
                        reportedWinnerId: t2.id,
                        reportedScore1: 0,
                        reportedScore2: 2,
                        reportedAtUtc: new Date().toISOString()
                      })}
                      className="px-3 py-2 rounded bg-red-950/40 hover:bg-red-900 border border-red-500/40 text-xs font-mono text-red-300 transition-all text-left"
                    >
                      Conflict: {t2?.tag} 2-0 Win
                    </button>
                  </div>
                </div>

                {/* Score Bump */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Live Score Increment:</span>
                  <button
                    onClick={() => onIncrementScore(selectedMatch.id, 2)}
                    className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-500/30"
                  >
                    +1 {t2?.tag} Round
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
