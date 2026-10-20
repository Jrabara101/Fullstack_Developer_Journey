export type FighterClass = 'WARRIOR' | 'BATTLE_MAGE' | 'ROGUE';
export type AIArchetype = 'MINION_MELEE' | 'ARCHER' | 'ARENA_BRUTE' | 'BOSS_WARLORD';
export type AttackTelegraphType = 'CIRCLE' | 'CONE' | 'LINE_CHARGING';

export interface Vector2D {
  x: number;
  y: number;
}

export interface TelegraphZone {
  id: string;
  type: AttackTelegraphType;
  origin: Vector2D;
  radius: number;
  angleRad?: number;
  coneAngleDeg?: number;
  durationMs: number;
  elapsedMs: number;
}

export interface AbilityDefinition {
  id: string;
  name: string;
  hotkey: string;
  manaCost: number;
  staminaCost: number;
  cooldownMs: number;
  lastUsedTimestamp: number;
  iconName: string;
  description: string;
}

export interface CombatEntity {
  id: string;
  name: string;
  isPlayer: boolean;
  pos: Vector2D;
  velocity: Vector2D;
  rotationAngle: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  posture: number; // 0 - 100 (100 = Posture Broken)
  isStaggered: boolean;
  staggerTimerMs: number;
  isInvulnerable: boolean; // active during dodge roll
  radius: number;
  statusEffects?: {
    frozenMs?: number;
    burnedMs?: number;
    overdriveMs?: number;
  };
}

export interface EnemyEntity extends CombatEntity {
  archetype: AIArchetype;
  aiState: 'IDLE_STALK' | 'ORBIT' | 'WINDUP' | 'ATTACKING' | 'RECOVERY' | 'STAGGERED' | 'ENRAGED';
  activeTelegraph: TelegraphZone | null;
  targetPos: Vector2D;
  attackCooldownMs: number;
  stateTimerMs: number;
  orbitAngle: number;
  orbitRadius: number;
  orbitDirection: number;
  hasAggressionToken: boolean;
  phase?: number;
  maxPhase?: number;
}

export interface Projectile {
  id: string;
  sourceId: string;
  isPlayer: boolean;
  pos: Vector2D;
  velocity: Vector2D;
  radius: number;
  damage: number;
  element?: 'PHYSICAL' | 'FROST' | 'FIRE';
  lifeMs: number;
  maxLifeMs: number;
}

export interface ArenaHazard {
  id: string;
  type: 'LAVA_GRATE' | 'PENDULUM_BLADE';
  pos: Vector2D;
  radius: number;
  isActive: boolean;
  angle?: number;
  periodMs: number;
  elapsedMs: number;
}

export interface ArenaGameState {
  status: 'LOBBY' | 'WAVE_COUNTDOWN' | 'BATTLE_ACTIVE' | 'WAVE_CLEARED' | 'GAME_OVER' | 'VICTORY';
  seed: string;
  currentWave: number;
  totalWaves: number;
  countdownSeconds: number;
  player: CombatEntity & {
    fighterClass: FighterClass;
    mana: number;
    maxMana: number;
    abilities: AbilityDefinition[];
  };
  enemies: EnemyEntity[];
  hazards: ArenaHazard[];
  activeTelegraphs: TelegraphZone[];
  stats: {
    damageDealt: number;
    damageTaken: number;
    parriesSucceeded: number;
    postureBreaksTriggered: number;
    timeElapsedMs: number;
    wavesCleared: number;
  };
}

export interface TelemetryPoint {
  timeMs: number;
  action: 'MOVE' | 'SLASH' | 'PARRY' | 'DASH' | 'FROST_NOVA' | 'FLAME_SWEEP' | 'OVERDRIVE' | 'DAMAGE_DEALT' | 'DAMAGE_TAKEN' | 'POSTURE_BREAK';
  x: number;
  y: number;
  targetId?: string;
  damageTaken?: number;
  damageDealt?: number;
}

export interface RunScorecard {
  id: string;
  callsign: string;
  seed: string;
  fighterClass: FighterClass;
  wavesCleared: number;
  clearTimeMs: number;
  totalParries: number;
  postureBreaks: number;
  score: number;
  scorecardEmoji: string;
  verified: boolean;
  createdAt: number;
}

export const ARENA_CONSTANTS = {
  ARENA_RADIUS: 520,
  TICK_RATE: 60,
  PARRY_WINDOW_MS: 150,
  DODGE_IFRAME_MS: 300,
  POSTURE_MAX: 100
};
