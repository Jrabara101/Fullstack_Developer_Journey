export type PowerUpType = 
  | 'multi_ball' 
  | 'laser' 
  | 'wide_paddle' 
  | 'slow_mo' 
  | 'magnetic' 
  | 'explosive';

export interface PowerUpInfo {
  type: PowerUpType;
  name: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  durationMs: number;
}

export type BrickTier = 0 | 1 | 2 | 3 | 4;
// 0: Emerald (1-hit)
// 1: Amber (2-hit)
// 2: Armored Magenta (3-hit)
// 3: Explosive Cluster (Detonates neighbors)
// 4: Cyber Barrier (Unbreakable or high shield)

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  tier: BrickTier;
  hits: number;
  maxHits: number;
  status: 0 | 1;
  pulse: number;
  powerUpType?: PowerUpType;
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  attached: boolean;
  trail: TrailPoint[];
  isExplosive?: boolean;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  baseWidth: number;
  targetX: number;
  glowTimer: number;
  activeZone: number; // 1 to 5
  hasLasers: boolean;
  laserCooldown: number;
  isMagnetic: boolean;
  caughtBall: Ball | null;
}

export interface PowerUpDrop {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
  totalDuration: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation?: number;
  vRot?: number;
}

export interface LaserBeam {
  id: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
}

export interface SectorLevel {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  rows: number;
  cols: number;
  pattern: (r: number, c: number) => { tier: BrickTier; hits: number; powerUp?: PowerUpType } | null;
}

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  reducedMotion: boolean;
  crtOverlay: boolean;
  ballSpeedMultiplier: number; // 0.85 (Casual), 1.0 (Normal), 1.2 (Hyper)
  homingAssistEnabled: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  combo: number;
  maxCombo: number;
  bricksDestroyed: number;
  totalBricks: number;
  activeSector: number;
  isGameOver: boolean;
  isVictory: boolean;
  rank: 'S+' | 'A' | 'B' | 'C' | 'D';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}
