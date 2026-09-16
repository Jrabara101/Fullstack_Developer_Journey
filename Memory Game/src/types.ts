export type Difficulty = 'easy' | 'medium' | 'hard';
export type TimerMode = 'countdown' | 'stopwatch';
export type ShapeCategory = 'circle' | 'square' | 'diamond' | 'hexagon' | 'triangle' | 'star' | 'shield' | 'cross';

export interface CardData {
  id: string;
  pairId: string;
  icon: string;
  label: string;
  shape: ShapeCategory;
  archetype: string;
  accentColor: string;
  isFlipped: boolean;
  isMatched: boolean;
  isShaking: boolean;
  isHighlighted: boolean;
}

export type GameStatus = 'idle' | 'glimpse' | 'playing' | 'paused' | 'won' | 'lost';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  subtitle: string;
  gridCols: number;
  gridRows: number;
  totalCards: number;
  totalPairs: number;
  countdownSeconds: number;
  mismatchPenaltySeconds: number;
  description: string;
}

export interface GameStats {
  moves: number;
  flips: number;
  pairsCleared: number;
  totalPairs: number;
  combo: number;
  maxCombo: number;
  score: number;
  accuracy: number;
  timeRemaining: number;
  timeElapsed: number;
  hintsRemaining: number;
}

export interface ScoreRecord {
  id: string;
  date: string;
  timestamp: number;
  difficulty: Difficulty;
  timerMode: TimerMode;
  moves: number;
  timeSeconds: number;
  accuracy: number;
  score: number;
  maxCombo: number;
  won: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  reducedMotion: boolean;
  glimpseEnabled: boolean;
  highContrast: boolean;
}
