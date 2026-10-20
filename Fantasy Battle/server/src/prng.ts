// Mulberry32 deterministic PRNG
export function createMulberry32(seedStr: string): () => number {
  // Hash seed string to 32-bit unsigned integer
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619) >>> 0;
  }
  let a = h;

  return function next(): number {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type AIArchetype = 'MINION_MELEE' | 'ARCHER' | 'ARENA_BRUTE' | 'BOSS_WARLORD';

export interface DailyWaveConfig {
  waveNumber: number;
  enemies: {
    archetype: AIArchetype;
    count: number;
    hpMultiplier: number;
    damageMultiplier: number;
  }[];
  hazards: {
    type: 'LAVA_GRATE' | 'PENDULUM_BLADE';
    x: number;
    y: number;
    radius: number;
    periodMs: number;
  }[];
}

export interface DailySeedData {
  seed: string;
  trialNumber: number;
  dateStr: string;
  totalWaves: number;
  waves: DailyWaveConfig[];
  arenaRadius: number;
}

export function generateDailyArenaData(customSeed?: string): DailySeedData {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  const seed = customSeed || `COLOSSEUM-${dateStr}`;
  const rng = createMulberry32(seed);

  // Derive trial number
  const trialNumber = Math.floor(rng() * 9000) + 1000;

  const waves: DailyWaveConfig[] = [
    {
      waveNumber: 1,
      enemies: [{ archetype: 'MINION_MELEE', count: 3, hpMultiplier: 1.0, damageMultiplier: 1.0 }],
      hazards: [
        { type: 'LAVA_GRATE', x: 250, y: 250, radius: 45, periodMs: 4000 }
      ]
    },
    {
      waveNumber: 2,
      enemies: [
        { archetype: 'MINION_MELEE', count: 2, hpMultiplier: 1.1, damageMultiplier: 1.0 },
        { archetype: 'ARCHER', count: 2, hpMultiplier: 0.9, damageMultiplier: 1.1 }
      ],
      hazards: [
        { type: 'LAVA_GRATE', x: -250, y: 250, radius: 45, periodMs: 4000 },
        { type: 'PENDULUM_BLADE', x: 0, y: 200, radius: 35, periodMs: 3200 }
      ]
    },
    {
      waveNumber: 3,
      enemies: [
        { archetype: 'ARENA_BRUTE', count: 1, hpMultiplier: 1.3, damageMultiplier: 1.2 },
        { archetype: 'MINION_MELEE', count: 2, hpMultiplier: 1.1, damageMultiplier: 1.0 },
        { archetype: 'ARCHER', count: 1, hpMultiplier: 1.0, damageMultiplier: 1.1 }
      ],
      hazards: [
        { type: 'LAVA_GRATE', x: 250, y: -250, radius: 50, periodMs: 3500 },
        { type: 'PENDULUM_BLADE', x: -180, y: 0, radius: 35, periodMs: 3000 }
      ]
    },
    {
      waveNumber: 4,
      enemies: [
        { archetype: 'ARENA_BRUTE', count: 2, hpMultiplier: 1.4, damageMultiplier: 1.25 },
        { archetype: 'ARCHER', count: 2, hpMultiplier: 1.2, damageMultiplier: 1.2 },
        { archetype: 'MINION_MELEE', count: 2, hpMultiplier: 1.2, damageMultiplier: 1.1 }
      ],
      hazards: [
        { type: 'LAVA_GRATE', x: 0, y: 0, radius: 60, periodMs: 3000 },
        { type: 'PENDULUM_BLADE', x: 220, y: -100, radius: 40, periodMs: 2800 },
        { type: 'PENDULUM_BLADE', x: -220, y: 100, radius: 40, periodMs: 2800 }
      ]
    },
    {
      waveNumber: 5,
      enemies: [
        { archetype: 'BOSS_WARLORD', count: 1, hpMultiplier: 2.5, damageMultiplier: 1.4 },
        { archetype: 'ARENA_BRUTE', count: 1, hpMultiplier: 1.2, damageMultiplier: 1.1 }
      ],
      hazards: [
        { type: 'LAVA_GRATE', x: -200, y: -200, radius: 55, periodMs: 3200 },
        { type: 'LAVA_GRATE', x: 200, y: 200, radius: 55, periodMs: 3200 },
        { type: 'PENDULUM_BLADE', x: 0, y: -220, radius: 45, periodMs: 2500 }
      ]
    }
  ];

  return {
    seed,
    trialNumber,
    dateStr,
    totalWaves: 5,
    waves,
    arenaRadius: 520
  };
}
