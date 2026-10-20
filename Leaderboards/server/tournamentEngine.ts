import { TournamentState, BracketNode, MatchStatus, CaptainReport, TeamEntity } from '../src/types/tournament';
import { createInitialTournamentState } from './initialData';

export class TournamentEngine {
  private state: TournamentState;

  constructor() {
    this.state = createInitialTournamentState();
  }

  public getState(): TournamentState {
    return this.state;
  }

  public reset(): TournamentState {
    this.state = createInitialTournamentState();
    this.state.lastMutation = {
      matchId: '',
      type: 'RESET',
      timestamp: Date.now(),
      details: 'Tournament state reset to initial bracket'
    };
    return this.state;
  }

  public getMatch(matchId: string): BracketNode | undefined {
    return this.state.bracketNodes.find(m => m.id === matchId);
  }

  public getTeam(teamId: string): TeamEntity | undefined {
    return this.state.teams.find(t => t.id === teamId);
  }

  public setMatchStatus(matchId: string, status: MatchStatus): { match: BracketNode; state: TournamentState } {
    const match = this.getMatch(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    match.status = status;
    if (status === 'LIVE' && !this.state.activeLiveMatches.includes(matchId)) {
      this.state.activeLiveMatches.push(matchId);
    } else if (status !== 'LIVE') {
      this.state.activeLiveMatches = this.state.activeLiveMatches.filter(id => id !== matchId);
    }

    this.state.lastMutation = {
      matchId,
      type: 'STATUS_CHANGE',
      timestamp: Date.now(),
      details: `Match ${matchId} status changed to ${status}`
    };

    return { match, state: this.state };
  }

  public incrementLiveScore(matchId: string, teamSlot: 1 | 2, points: number = 1): { match: BracketNode; state: TournamentState } {
    const match = this.getMatch(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    if (match.status !== 'LIVE' && match.status !== 'READY') {
      match.status = 'LIVE';
      if (!this.state.activeLiveMatches.includes(matchId)) {
        this.state.activeLiveMatches.push(matchId);
      }
    }

    // Update active map if available
    let activeMap = match.maps.find(m => m.status === 'IN_PROGRESS');
    if (!activeMap) {
      activeMap = match.maps.find(m => m.status === 'UPCOMING');
      if (activeMap) activeMap.status = 'IN_PROGRESS';
    }

    if (activeMap) {
      if (teamSlot === 1) activeMap.score1 += points;
      else activeMap.score2 += points;
      activeMap.currentRound = (activeMap.currentRound || 0) + points;

      // Check for map completion (first to 13, win by 2)
      const s1 = activeMap.score1;
      const s2 = activeMap.score2;
      const mapWon = (s1 >= 13 && s1 - s2 >= 2) || (s2 >= 13 && s2 - s1 >= 2);
      if (mapWon) {
        activeMap.status = 'COMPLETED';
        if (s1 > s2) match.team1.score += 1;
        else match.team2.score += 1;

        // Check if next map should start
        const neededToWin = Math.ceil(match.bestOf / 2);
        if (match.team1.score >= neededToWin || match.team2.score >= neededToWin) {
          // Series won!
          const winnerSlot = match.team1.score >= neededToWin ? 1 : 2;
          const winner = winnerSlot === 1 ? match.team1.team : match.team2.team;
          if (winner) {
            this.finalizeMatch(match, winner.id);
          }
        } else {
          // Start next map
          const nextUpcoming = match.maps.find(m => m.status === 'UPCOMING');
          if (nextUpcoming) nextUpcoming.status = 'IN_PROGRESS';
        }
      }
    } else {
      // Direct series score increment fallback
      if (teamSlot === 1) match.team1.score += points;
      else match.team2.score += points;

      const neededToWin = Math.ceil(match.bestOf / 2);
      if (match.team1.score >= neededToWin || match.team2.score >= neededToWin) {
        const winnerSlot = match.team1.score >= neededToWin ? 1 : 2;
        const winner = winnerSlot === 1 ? match.team1.team : match.team2.team;
        if (winner) this.finalizeMatch(match, winner.id);
      }
    }

    match.liveFlareTimestamp = Date.now();
    this.state.lastMutation = {
      matchId,
      teamSlot,
      teamId: teamSlot === 1 ? match.team1.team?.id : match.team2.team?.id,
      type: 'SCORE_INCREMENT',
      timestamp: Date.now(),
      details: `Score incremented for Team ${teamSlot} in match ${match.stageName}`
    };

    return { match, state: this.state };
  }

  public submitCaptainReport(matchId: string, report: CaptainReport): { match: BracketNode; state: TournamentState; conflict: boolean } {
    const match = this.getMatch(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    if (!match.captainReports) {
      match.captainReports = {};
    }

    const isTeam1 = match.team1.team?.id === report.teamId || match.team1.team?.captainId === report.captainId;
    const isTeam2 = match.team2.team?.id === report.teamId || match.team2.team?.captainId === report.captainId;

    if (!isTeam1 && !isTeam2) {
      throw new Error(`Captain ${report.captainName} does not belong to either team in match ${matchId}`);
    }

    if (isTeam1) {
      match.captainReports.team1Report = report;
      match.team1.isReportedWinner = report.reportedWinnerId === match.team1.team?.id;
    } else {
      match.captainReports.team2Report = report;
      match.team2.isReportedWinner = report.reportedWinnerId === match.team2.team?.id;
    }

    const r1 = match.captainReports.team1Report;
    const r2 = match.captainReports.team2Report;
    let conflict = false;

    // If both captains have reported, verify consensus
    if (r1 && r2) {
      const winnerAgreed = r1.reportedWinnerId === r2.reportedWinnerId;
      const scoreAgreed = r1.reportedScore1 === r2.reportedScore1 && r1.reportedScore2 === r2.reportedScore2;

      if (winnerAgreed && scoreAgreed) {
        // Consensus confirmed!
        match.team1.score = r1.reportedScore1;
        match.team2.score = r1.reportedScore2;
        match.disputeReason = undefined;
        this.finalizeMatch(match, r1.reportedWinnerId);

        this.state.lastMutation = {
          matchId,
          type: 'WINNER_ADVANCE',
          timestamp: Date.now(),
          details: `Consensus reached! Team ${r1.reportedWinnerId} confirmed winner.`
        };
      } else {
        // Dispute detected!
        conflict = true;
        match.status = 'DISPUTED';
        const team1Winner = this.getTeam(r1.reportedWinnerId)?.name || r1.reportedWinnerId;
        const team2Winner = this.getTeam(r2.reportedWinnerId)?.name || r2.reportedWinnerId;
        match.disputeReason = `Conflicting Reports: ${r1.captainName} (${match.team1.team?.tag}) reported ${team1Winner} won (${r1.reportedScore1}-${r1.reportedScore2}), but ${r2.captainName} (${match.team2.team?.tag}) reported ${team2Winner} won (${r2.reportedScore1}-${r2.reportedScore2}).`;

        this.state.lastMutation = {
          matchId,
          type: 'DISPUTE',
          timestamp: Date.now(),
          details: match.disputeReason
        };
      }
    } else {
      this.state.lastMutation = {
        matchId,
        type: 'CAPTAIN_REPORT',
        timestamp: Date.now(),
        details: `Captain ${report.captainName} submitted report for ${report.teamId}. Waiting for opposing captain.`
      };
    }

    return { match, state: this.state, conflict };
  }

  public resolveDispute(
    matchId: string,
    winnerId: string,
    score1: number,
    score2: number,
    adminNotes?: string
  ): { match: BracketNode; state: TournamentState } {
    const match = this.getMatch(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    match.disputeReason = undefined;
    match.team1.score = score1;
    match.team2.score = score2;
    this.finalizeMatch(match, winnerId);

    this.state.lastMutation = {
      matchId,
      type: 'WINNER_ADVANCE',
      timestamp: Date.now(),
      details: `Admin resolved dispute: Winner confirmed as ${this.getTeam(winnerId)?.name || winnerId} (${score1}-${score2}). Notes: ${adminNotes || 'None'}`
    };

    return { match, state: this.state };
  }

  private finalizeMatch(match: BracketNode, winnerId: string) {
    match.status = 'COMPLETED';
    match.winnerId = winnerId;
    this.state.activeLiveMatches = this.state.activeLiveMatches.filter(id => id !== match.id);

    const winner = this.getTeam(winnerId);
    const loser = match.team1.team?.id === winnerId ? match.team2.team : match.team1.team;

    // Advance winner to nextMatchId
    if (match.nextMatchId && winner) {
      const nextMatch = this.getMatch(match.nextMatchId);
      if (nextMatch) {
        if (!nextMatch.team1.team) {
          nextMatch.team1.team = winner;
        } else if (!nextMatch.team2.team && nextMatch.team1.team.id !== winner.id) {
          nextMatch.team2.team = winner;
        }

        if (nextMatch.team1.team && nextMatch.team2.team && nextMatch.status === 'SCHEDULED') {
          nextMatch.status = 'READY';
        }
      }
    }

    // Advance loser to loserMatchId (for Double Elimination)
    if (match.loserMatchId && loser) {
      const loserMatch = this.getMatch(match.loserMatchId);
      if (loserMatch) {
        if (!loserMatch.team1.team) {
          loserMatch.team1.team = loser;
        } else if (!loserMatch.team2.team && loserMatch.team1.team.id !== loser.id) {
          loserMatch.team2.team = loser;
        }

        if (loserMatch.team1.team && loserMatch.team2.team && loserMatch.status === 'SCHEDULED') {
          loserMatch.status = 'READY';
        }
      }
    }
  }

  public simulateNextTick(): { event: string; match?: BracketNode; state: TournamentState } {
    // Check if there are live matches
    const liveMatches = this.state.bracketNodes.filter(m => m.status === 'LIVE');
    if (liveMatches.length > 0) {
      // Pick one randomly
      const match = liveMatches[Math.floor(Math.random() * liveMatches.length)];
      // Randomly award point to team 1 or team 2
      const slot: 1 | 2 = Math.random() > 0.48 ? 1 : 2;
      this.incrementLiveScore(match.id, slot, 1);
      return {
        event: `Live round won by ${slot === 1 ? match.team1.team?.name : match.team2.team?.name}!`,
        match,
        state: this.state
      };
    }

    // If no live matches, check for READY matches and set one to LIVE
    const readyMatch = this.state.bracketNodes.find(m => m.status === 'READY');
    if (readyMatch) {
      readyMatch.status = 'LIVE';
      if (!this.state.activeLiveMatches.includes(readyMatch.id)) {
        this.state.activeLiveMatches.push(readyMatch.id);
      }
      const firstUpcoming = readyMatch.maps.find(m => m.status === 'UPCOMING');
      if (firstUpcoming) firstUpcoming.status = 'IN_PROGRESS';

      this.state.lastMutation = {
        matchId: readyMatch.id,
        type: 'STATUS_CHANGE',
        timestamp: Date.now(),
        details: `Match ${readyMatch.stageName} (${readyMatch.team1.team?.tag} vs ${readyMatch.team2.team?.tag}) is now LIVE!`
      };
      return {
        event: `Match ${readyMatch.stageName} has started and is now LIVE!`,
        match: readyMatch,
        state: this.state
      };
    }

    return {
      event: 'No active or ready matches to simulate.',
      state: this.state
    };
  }
}
