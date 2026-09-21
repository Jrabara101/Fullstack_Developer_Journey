export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export interface Point {
  x: number
  y: number
}

export interface Food {
  x: number
  y: number
  type: 'regular' | 'bonus'
  spawnedAt?: number
  durationMs?: number
  remainingMs?: number
  multiplier?: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  maxLife: number
  size: number
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'CRASHED'
export type Difficulty = 'CASUAL' | 'NORMAL' | 'HARDCORE'

export interface GameTelemetry {
  score: number
  highScore: number
  applesEaten: number
  bonusEaten: number
  multiplier: number
  speedMultiplier: number
  tickRateMs: number
  elapsedSeconds: number
  trailLength: number
  status: GameStatus
  difficulty: Difficulty
  collisionPoint: Point | null
  headPulse: number // 0 to 1 scale pulse
  rippleIndex: number // For chromatic wave traveling down tail
}
