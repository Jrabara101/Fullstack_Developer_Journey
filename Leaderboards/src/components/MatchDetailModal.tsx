import React, { useState } from 'react';
import { BracketNode, CaptainReport, TeamEntity } from '../types/tournament';
import { X, Play, AlertTriangle, ShieldCheck, Trophy, Tv, CheckCircle, Flag, MessageSquare } from 'lucide-react';
import { cn, formatUtcTime } from '../lib/utils';

interface MatchDetailModalProps {
  match: BracketNode | null;
  onClose: () => void;
  onIncrementScore: (matchId: string, teamSlot: 1 | 2) => void;
  onSubmitReport: (matchId: string, report: CaptainReport) => void;
  onResolveDispute: (matchId: string, winnerId: string, score1: number, score2: number, adminNotes?: string) => void;
  onSetStatus: (matchId: string, status: any) => void;
  onOpenTeamRoster: (teamId: string) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
  onIncrementScore,
  onSubmitReport,
  onResolveDispute,
  onSetStatus,
  onOpenTeamRoster,
}) => {
  if (!match) return null;

  const [activeTab, setActiveTab] = useState<'maps' | 'captain' | 'stream'>('maps');
  const [adminNotes, setAdminNotes] = useState('');

  const isLive = match.status === 'LIVE';
  const isDisputed = match.status === 'DISPUTED';
  const isCompleted = match.status === 'COMPLETED';

  const timeInfo = formatUtcTime(match.scheduledTimeUtc);

  const t1 = match.team1.team;
  const t2 = match.team2.team;

  // Test captain report helpers
  const handleTestReportTeam1 = (winnerSlot: 1 | 2, s1: number, s2: number) => {
    if (!t1) return;
    const reportedWinner = winnerSlot === 1 ? t1.id : (t2?.id || t1.id);
    onSubmitReport(match.id, {
      captainId: t1.captainId,
      captainName: t1.captainName,
      teamId: t1.id,
      reportedWinnerId: reportedWinner,
      reportedScore1: s1,
      reportedScore2: s2,
      reportedAtUtc: new Date().toISOString(),
      notes: `Official submission from Captain ${t1.captainName}`
    });
  };

  const handleTestReportTeam2 = (winnerSlot: 1 | 2, s1: number, s2: number) => {
    if (!t2) return;
    const reportedWinner = winnerSlot === 1 ? (t1?.id || t2.id) : t2.id;
    onSubmitReport(match.id, {
      captainId: t2.captainId,
      captainName: t2.captainName,
      teamId: t2.id,
      reportedWinnerId: reportedWinner,
      reportedScore1: s1,
      reportedScore2: s2,
      reportedAtUtc: new Date().toISOString(),
      notes: `Official submission from Captain ${t2.captainName}`
    });
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-xl bg-[#0C101A] border border-[#1E283D] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#131926] border-b border-[#1E283D]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
              {match.stageName} • BEST OF {match.bestOf}
            </span>

            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                LIVE BROADCAST
              </span>
            )}

            {isDisputed && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                DISPUTE IN PROGRESS
              </span>
            )}

            {isCompleted && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                MATCH FINALIZED
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispute Alert Banner if Disputed */}
        {isDisputed && (
          <div className="bg-amber-950/60 border-b border-amber-500/40 px-6 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="text-amber-300 font-display block uppercase tracking-wide">
                Dual-Captain Dispute Detected
              </strong>
              <p className="text-amber-200/90 font-mono mt-0.5">
                {match.disputeReason}
              </p>
            </div>
          </div>
        )}

        {/* Match Scoreboard Head-to-Head */}
        <div className="p-6 bg-gradient-to-b from-[#131926] to-[#0C101A] border-b border-[#1E283D]">
          <div className="flex items-center justify-between">
            {/* Team 1 */}
            <div className="flex-1 flex flex-col items-center sm:items-start">
              {t1 ? (
                <div
                  onClick={() => onOpenTeamRoster(t1.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={t1.logo}
                    alt={t1.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 group-hover:border-[#38BDF8] transition-colors"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">#{t1.seed} SEED</span>
                      <span className="text-[10px] font-mono text-slate-500">• {t1.region}</span>
                    </div>
                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-white group-hover:text-cyan-300 transition-colors">
                      {t1.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      Captain: <strong className="text-slate-300">{t1.captainName}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <span className="font-mono text-slate-500">TBD Team</span>
              )}

              {/* Quick live score bump */}
              {isLive && t1 && (
                <button
                  onClick={() => onIncrementScore(match.id, 1)}
                  className="mt-3 px-3 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all"
                >
                  +1 ROUND WIN
                </button>
              )}
            </div>

            {/* Center Score Block */}
            <div className="flex flex-col items-center px-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white px-3 py-1 rounded bg-slate-900 border border-slate-800">
                  {match.team1.score}
                </span>
                <span className="font-display text-2xl font-bold text-slate-600">:</span>
                <span className="font-mono text-4xl sm:text-5xl font-black text-white px-3 py-1 rounded bg-slate-900 border border-slate-800">
                  {match.team2.score}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">
                {timeInfo.utc}
              </span>
            </div>

            {/* Team 2 */}
            <div className="flex-1 flex flex-col items-center sm:items-end">
              {t2 ? (
                <div
                  onClick={() => onOpenTeamRoster(t2.id)}
                  className="flex items-center flex-row-reverse gap-3 cursor-pointer group text-right"
                >
                  <img
                    src={t2.logo}
                    alt={t2.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 group-hover:border-[#38BDF8] transition-colors"
                  />
                  <div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[10px] font-mono text-slate-500">{t2.region} •</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">#{t2.seed} SEED</span>
                    </div>
                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-white group-hover:text-cyan-300 transition-colors">
                      {t2.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      Captain: <strong className="text-slate-300">{t2.captainName}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <span className="font-mono text-slate-500">TBD Team</span>
              )}

              {/* Quick live score bump */}
              {isLive && t2 && (
                <button
                  onClick={() => onIncrementScore(match.id, 2)}
                  className="mt-3 px-3 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all"
                >
                  +1 ROUND WIN
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#1E283D] bg-[#0C101A] px-6">
          <button
            onClick={() => setActiveTab('maps')}
            className={cn(
              'px-4 py-2.5 text-xs font-display font-bold border-b-2 transition-colors',
              activeTab === 'maps'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            MAP VETO & ROUND BREAKDOWN
          </button>
          <button
            onClick={() => setActiveTab('captain')}
            className={cn(
              'px-4 py-2.5 text-xs font-display font-bold border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'captain'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>DUAL-CAPTAIN REPORTING DESK</span>
            {isDisputed && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={cn(
              'px-4 py-2.5 text-xs font-display font-bold border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'stream'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>BROADCAST STREAM</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'maps' && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                MAP ROTATION ({match.maps.length} MAPS SCHEDULED)
              </h4>

              <div className="grid gap-3">
                {match.maps.map((map, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 rounded-lg border flex items-center justify-between transition-colors',
                      map.status === 'IN_PROGRESS'
                        ? 'bg-red-500/10 border-red-500/40'
                        : map.status === 'COMPLETED'
                        ? 'bg-[#131926] border-slate-800'
                        : 'bg-[#0C101A] border-slate-800/60 opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                        {map.mapNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-white">
                            {map.mapName}
                          </span>
                          {map.status === 'IN_PROGRESS' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 animate-pulse">
                              ROUND {map.currentRound || (map.score1 + map.score2)}
                            </span>
                          )}
                          {map.status === 'COMPLETED' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 font-bold">
                              FINAL
                            </span>
                          )}
                        </div>
                        {map.pickedBy && (
                          <span className="text-[11px] font-mono text-slate-400">
                            Pick: {map.pickedBy === t1?.id ? t1?.name : t2?.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="font-mono text-lg font-extrabold text-white">
                        <span className={map.score1 > map.score2 && map.status === 'COMPLETED' ? 'text-emerald-400' : ''}>
                          {map.score1}
                        </span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span className={map.score2 > map.score1 && map.status === 'COMPLETED' ? 'text-emerald-400' : ''}>
                          {map.score2}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'captain' && (
            <div className="space-y-6">
              {/* Dual Captain Reporting Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Captain 1 Box */}
                <div className="p-4 rounded-lg bg-[#131926] border border-[#1E283D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {t1?.tag} CAPTAIN: {t1?.captainName}
                    </span>
                    {match.captainReports?.team1Report ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                        SUBMITTED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500">
                        PENDING
                      </span>
                    )}
                  </div>

                  {match.captainReports?.team1Report ? (
                    <div className="bg-[#0C101A] p-3 rounded border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                      <div>Reported Winner: <strong className="text-white">{match.captainReports.team1Report.reportedWinnerId === t1?.id ? t1?.name : t2?.name}</strong></div>
                      <div>Reported Score: <strong className="text-white">{match.captainReports.team1Report.reportedScore1} - {match.captainReports.team1Report.reportedScore2}</strong></div>
                      <div className="text-[10px] text-slate-500">At: {match.captainReports.team1Report.reportedAtUtc}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Simulate official report transmission from Captain {t1?.captainName}:
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleTestReportTeam1(1, 2, 0)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
                    >
                      Report {t1?.tag} 2-0 Win
                    </button>
                    <button
                      onClick={() => handleTestReportTeam1(1, 2, 1)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
                    >
                      Report {t1?.tag} 2-1 Win
                    </button>
                    <button
                      onClick={() => handleTestReportTeam1(2, 1, 2)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
                    >
                      Report {t2?.tag} 2-1 Win
                    </button>
                  </div>
                </div>

                {/* Captain 2 Box */}
                <div className="p-4 rounded-lg bg-[#131926] border border-[#1E283D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {t2?.tag} CAPTAIN: {t2?.captainName}
                    </span>
                    {match.captainReports?.team2Report ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                        SUBMITTED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500">
                        PENDING
                      </span>
                    )}
                  </div>

                  {match.captainReports?.team2Report ? (
                    <div className="bg-[#0C101A] p-3 rounded border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                      <div>Reported Winner: <strong className="text-white">{match.captainReports.team2Report.reportedWinnerId === t1?.id ? t1?.name : t2?.name}</strong></div>
                      <div>Reported Score: <strong className="text-white">{match.captainReports.team2Report.reportedScore1} - {match.captainReports.team2Report.reportedScore2}</strong></div>
                      <div className="text-[10px] text-slate-500">At: {match.captainReports.team2Report.reportedAtUtc}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Simulate official report transmission from Captain {t2?.captainName}:
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleTestReportTeam2(1, 2, 0)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
                    >
                      Report {t1?.tag} 2-0 Win (Consensus)
                    </button>
                    <button
                      onClick={() => handleTestReportTeam2(2, 0, 2)}
                      className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-xs font-mono text-red-200 transition-colors"
                    >
                      Report {t2?.tag} 2-0 Win (Trigger Conflict!)
                    </button>
                  </div>
                </div>
              </div>

              {/* Dispute Resolution Section for Admin */}
              {isDisputed && t1 && t2 && (
                <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ADMIN DISPUTE OVERRIDE DESK</span>
                  </div>
                  <p className="text-xs text-amber-200 font-mono">
                    Both captains submitted conflicting telemetry. Choose the verified tournament winner to override and advance the bracket:
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => onResolveDispute(match.id, t1.id, 2, 1, 'Admin verified server VOD logs: Team 1 won')}
                      className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all"
                    >
                      Declare {t1.name} Winner (2 - 1)
                    </button>
                    <button
                      onClick={() => onResolveDispute(match.id, t2.id, 1, 2, 'Admin verified server VOD logs: Team 2 won')}
                      className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all"
                    >
                      Declare {t2.name} Winner (2 - 1)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stream' && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-xl bg-black border border-slate-800 relative flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#07090E] to-black opacity-80" />
                <div className="text-center relative z-10 space-y-3 p-6">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/40 animate-pulse">
                    <Tv className="w-7 h-7" />
                  </div>
                  <h5 className="font-display font-bold text-lg text-white">
                    PRIMARY BROADCAST TELEMETRY FEED
                  </h5>
                  <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                    Live ultra-low latency WebSocket stream synced to Makuhari Messe Arena main stage.
                  </p>
                  <a
                    href="https://twitch.tv/valorant"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38BDF8] text-black font-mono font-bold text-xs hover:bg-cyan-300 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    OPEN EXTERNAL STREAM (TWITCH)
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
