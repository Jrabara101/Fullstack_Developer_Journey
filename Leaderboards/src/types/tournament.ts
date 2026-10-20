export type MatchStatus = 'SCHEDULED' | 'READY' | 'LIVE' | 'COMPLETED' | 'DISPUTED' | 'BYE';
export type TournamentFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION';

export interface PlayerEntity {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatar: string;
  rating?: number;
  country?: string;
}

export interface TeamEntity {
  id: string;
  name: string;
  tag: string;
  seed: number;
  logo: string;
  region: string;
  captainId: string;
  captainName: string;
  roster: PlayerEntity[];
  color?: string;
  stats?: {
    matchesWon: number;
    matchesLost: number;
    mapsWon: number;
    mapsLost: number;
  };
}

export interface MapScore {
  mapNumber: number;
  mapName: string;
  score1: number;
  score2: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  pickedBy?: string;
  durationMinutes?: number;
  currentRound?: number;
}

export interface CaptainReport {
  captainId: string;
  captainName: string;
  teamId: string;
  reportedWinnerId: string;
  reportedScore1: number;
  reportedScore2: number;
  reportedAtUtc: string;
  notes?: string;
}

export interface BracketNode {
  id: string;
  stageName: string; // e.g. "Upper Round 1", "Quarterfinal"
  roundIndex: number;
  matchIndex: number;
  bestOf: 1 | 3 | 5 | 7;
  status: MatchStatus;
  scheduledTimeUtc: string;
  estimatedStartTimeUtc?: string;
  team1: { team: TeamEntity | null; score: number; isReportedWinner?: boolean };
  team2: { team: TeamEntity | null; score: number; isReportedWinner?: boolean };
  winnerId?: string;
  nextMatchId?: string;
  loserMatchId?: string;
  maps: MapScore[];
  streamUrl?: string;
  bracketType?: 'UPPER' | 'LOWER' | 'GRAND_FINAL';
  disputeReason?: string;
  captainReports?: {
    team1Report?: CaptainReport;
    team2Report?: CaptainReport;
  };
  liveFlareTimestamp?: number;
}

export interface TournamentState {
  tournamentId: string;
  title: string;
  gameTitle: string;
  format: TournamentFormat;
  prizePool: string;
  currentStage: string;
  teams: TeamEntity[];
  bracketNodes: BracketNode[];
  activeLiveMatches: string[]; // match IDs currently marked 'LIVE'
  lastMutation?: {
    matchId: string;
    teamId?: string;
    teamSlot?: 1 | 2;
    type: 'SCORE_INCREMENT' | 'STATUS_CHANGE' | 'CAPTAIN_REPORT' | 'DISPUTE' | 'WINNER_ADVANCE' | 'RESET';
    timestamp: number;
    details?: string;
  };
}

export interface WsMessage {
  type: 'INIT' | 'TOURNAMENT_UPDATED' | 'SCORE_UPDATED' | 'MATCH_STATUS_CHANGED' | 'DISPUTE_RAISED' | 'WINNER_ADVANCED' | 'CAPTAIN_REPORTED';
  data: TournamentState;
  meta?: any;
}
