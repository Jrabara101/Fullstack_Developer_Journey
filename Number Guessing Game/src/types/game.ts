export type DirectionFeedback = 'TOO_HIGH' | 'TOO_LOW' | 'CORRECT';

export interface GuessRecord {
  value: number;
  direction: DirectionFeedback;
  distance: number;
  eliminatedPossibilities: number;
  timestamp: number;
}

export interface NumberGameState {
  target: number;
  rangeMin: number;
  rangeMax: number;
  currentMinBound: number;
  currentMaxBound: number;
  maxAttempts: number;
  attemptsUsed: number;
  history: GuessRecord[];
  status: 'IDLE' | 'ACTIVE_GUESSING' | 'VICTORY' | 'DEFEAT';
  score: number;
  hints: {
    parityRevealed: boolean;
    primeRevealed: boolean;
    digitSumRevealed: boolean;
  };
  dailyMode: boolean;
}

export type FSMStage =
  | 'IDLE'
  | 'ACTIVE_GUESSING'
  | 'EVALUATING'
  | 'HINT_MODAL'
  | 'VICTORY'
  | 'DEFEAT';

export type GameMode = 'daily' | 'unlimited' | 'timeAttack';

export type DeductionArchetype =
  | 'Binary Savant'
  | 'Tactical Infiltrator'
  | 'Thermal Tracker'
  | 'Risk Hacker'
  | 'Wild Gambler';

export interface ArchetypeResult {
  title: DeductionArchetype;
  description: string;
  efficiencyRating: number; // 0 - 100%
  optimalSteps: number;
  actualSteps: number;
  ratingTier: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface DailyStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // 1 to 7 attempts count
  lastPlayedDate: string; // ISO date YYYY-MM-DD
  history: {
    date: string;
    attempts: number;
    won: boolean;
    score: number;
    target: number;
    archetype: DeductionArchetype;
  }[];
}

export interface TelemetryProbes {
  parity: {
    isEven: boolean;
    cost: number;
  };
  prime: {
    isPrime: boolean;
    factors: number[];
    cost: number;
  };
  digitSum: {
    sum: number;
    range: string; // e.g. "10 ≤ Σ(d) ≤ 15"
    cost: number;
  };
}
