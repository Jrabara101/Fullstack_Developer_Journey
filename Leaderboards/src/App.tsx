import React from 'react';
import { useTournament } from './hooks/useTournament';
import { TopLiveTicker } from './components/TopLiveTicker';
import { TournamentHero } from './components/TournamentHero';
import { BracketCanvas } from './components/BracketCanvas';
import { MatchDetailModal } from './components/MatchDetailModal';
import { TeamRosterDrawer } from './components/TeamRosterDrawer';
import { ScheduleFeed } from './components/ScheduleFeed';
import { CaptainControlHub } from './components/CaptainControlHub';
import { Layers, Calendar, Users, SlidersHorizontal, Radio, Shield, Trophy } from 'lucide-react';

export default function App() {
  const {
    tournament,
    isConnected,
    selectedMatch,
    setSelectedMatch,
    hoveredTeamId,
    setHoveredTeamId,
    selectedTeamId,
    setSelectedTeamId,
    activeTab,
    setActiveTab,
    isRosterDrawerOpen,
    setIsRosterDrawerOpen,
    openTeamRoster,
    incrementScore,
    submitCaptainReport,
    resolveDispute,
    setMatchStatus,
    simulateTick,
    resetTournament
  } = useTournament();

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-300 font-mono space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-sm tracking-widest uppercase">INITIALIZING CYBER-COLOSSEUM TELEMETRY...</p>
      </div>
    );
  }

  const liveMatches = tournament.bracketNodes.filter(m => m.status === 'LIVE');

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F8FAFC] flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Top 44px Live Match Ticker */}
      <TopLiveTicker
        liveMatches={liveMatches}
        allMatches={tournament.bracketNodes}
        isConnected={isConnected}
        onSelectMatch={setSelectedMatch}
        onSimulateTick={simulateTick}
        onReset={resetTournament}
      />

      {/* 2. Tournament Hero Deck */}
      <TournamentHero
        tournament={tournament}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenRosterDrawer={() => setIsRosterDrawerOpen(true)}
      />

      {/* 3. Main Stage Content */}
      <main className="flex-1 relative">
        {activeTab === 'bracket' && (
          <BracketCanvas
            tournament={tournament}
            hoveredTeamId={hoveredTeamId}
            selectedTeamId={selectedTeamId}
            onSelectMatch={setSelectedMatch}
            onHoverTeam={setHoveredTeamId}
            onSelectTeam={setSelectedTeamId}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleFeed
            matches={tournament.bracketNodes}
            onSelectMatch={setSelectedMatch}
            onOpenTeamRoster={openTeamRoster}
          />
        )}

        {activeTab === 'teams' && (
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-4">
              <div>
                <h2 className="text-xl font-extrabold font-display text-white">
                  PARTICIPATING TEAMS & FRANCHISES
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  16 World-Class Esports Organizations Competing for the $1,000,000 Prize Pool
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tournament.teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => openTeamRoster(team.id)}
                  className="p-4 rounded-xl bg-[#131926] border border-[#1E283D] hover:border-[#38BDF8] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        SEED #{team.seed}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 uppercase">
                        {team.region}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h4 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                          {team.name}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">
                          TAG: {team.tag}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                      Captain: <strong className="text-slate-200">{team.captainName}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                    <span>VIEW ROSTER</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <CaptainControlHub
            tournament={tournament}
            onIncrementScore={incrementScore}
            onSubmitReport={submitCaptainReport}
            onResolveDispute={resolveDispute}
            onSimulateTick={simulateTick}
            onReset={resetTournament}
            onSelectMatch={setSelectedMatch}
          />
        )}
      </main>

      {/* 4. Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onIncrementScore={incrementScore}
        onSubmitReport={submitCaptainReport}
        onResolveDispute={resolveDispute}
        onSetStatus={setMatchStatus}
        onOpenTeamRoster={openTeamRoster}
      />

      {/* 5. Team Roster Drawer */}
      <TeamRosterDrawer
        isOpen={isRosterDrawerOpen}
        teams={tournament.teams}
        selectedTeamId={selectedTeamId}
        onClose={() => setIsRosterDrawerOpen(false)}
        onSelectTeamForTracking={(teamId) => {
          setSelectedTeamId(teamId);
          setActiveTab('bracket');
        }}
      />

      {/* 6. Mobile Bottom Navigation Bar */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-[#0C101A]/95 backdrop-blur-md border-t border-[#1E283D] flex items-center justify-around py-2 text-[10px] font-mono">
        <button
          onClick={() => setActiveTab('bracket')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'bracket' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <Layers className="w-4 h-4" />
          <span>BRACKET</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'schedule' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <Calendar className="w-4 h-4" />
          <span>SCHEDULE</span>
        </button>
        <button
          onClick={() => setIsRosterDrawerOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <Users className="w-4 h-4" />
          <span>ROSTERS</span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>ADMIN</span>
        </button>
      </nav>
    </div>
  );
}
