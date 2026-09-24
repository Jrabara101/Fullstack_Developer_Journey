export type ReactionPhase =
  | 'IDLE'
  | 'WAITING'
  | 'TRIGGERED'
  | 'EARLY_PENALTY'
  | 'ROUND_RESOLVED'
  | 'REPORT_SUMMARY';

export type ReflexMode = 'visual' | 'audio' | 'peripheral';

export interface ReactionRecord {
  id: string;
  timestamp: string; // ISO string
  timeBlock: 'morning' | 'afternoon' | 'late-night';
  mode: ReflexMode;
  averageMs: number;
  medianMs: number;
  bestMs: number;
  consistencyVariance: number;
  stdDevMs: number;
  rounds: number[];
  falseStarts: number;
  archetype: string;
  notes?: string;
  caffeineIntake?: boolean;
}

export interface PeripheralTarget {
  x: number; // percentage 10 - 90
  y: number; // percentage 15 - 85
  size: number; // px size
}

export interface ReactionSessionState {
  currentRound: number;
  totalRounds: number;
  phase: ReactionPhase;
  mode: ReflexMode;
  triggerTimestamp: number;
  currentRunMs: number | null;
  history: number[]; // Latencies for current 5-round batch in ms
  bestMs: number | null;
  falseStarts: number;
  sessions: ReactionRecord[];
  soundEnabled: boolean;
  peripheralTarget: PeripheralTarget | null;
  escalatingPenaltyCount: number;
}

export interface ArchetypeTier {
  id: string;
  name: string;
  title: string;
  rangeMin: number;
  rangeMax: number;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  percentileText: string;
  description: string;
}
