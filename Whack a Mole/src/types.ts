export type MoleType = 'normal' | 'gold' | 'bomb';

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Difficulty = 'easy' | 'normal' | 'hyper';

export type GridDimension = 3 | 4;

export interface MoleInstance {
  id: string;
  slotIndex: number;
  type: MoleType;
  spawnTime: number; // Date.now() timestamp
  duration: number;  // ms alive
  expiresAt: number; // spawnTime + duration
  hit: boolean;
}

export interface PopupItem {
  id: string;
  x: number;
  y: number;
  text: string;
  colorClass: string;
}

export interface GameStats {
  totalClicks: number;
  successfulHits: number;
  goldHits: number;
  bombHits: number;
  misses: number;
  maxCombo: number;
}

export interface DifficultyProfile {
  label: string;
  spawnMin: number;
  spawnMax: number;
  stayDuration: number;
  maxConcurrent: number;
  bombRate: number;
  goldRate: number;
}
