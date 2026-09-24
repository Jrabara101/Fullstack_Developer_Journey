import { ArchetypeTier, ReactionRecord, ReflexMode } from '../types/reaction';

export const ARCHETYPE_TIERS: ArchetypeTier[] = [
  {
    id: 'apex',
    name: 'Apex Pro / Fighter Pilot',
    title: 'SUPERSONIC // APEX COMBAT TIER',
    rangeMin: 0,
    rangeMax: 170,
    colorClass: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-400',
    badgeText: 'text-cyan-300',
    percentileText: 'TOP 0.5%',
    description: 'Neurological transmission operates at the outer physiological boundary of human biology. Comparable to elite Formula 1 drivers and 5th-gen fighter pilots.',
  },
  {
    id: 'esports',
    name: 'Esports Contender',
    title: 'PRO CONTENDER // TOURNAMENT READY',
    rangeMin: 171,
    rangeMax: 210,
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-400',
    badgeText: 'text-emerald-300',
    percentileText: 'TOP 5.0%',
    description: 'Sub-210ms reaction places you comfortably in high-tier competitive gaming and rapid-decision athletic fields.',
  },
  {
    id: 'baseline',
    name: 'Median Human Baseline',
    title: 'NOMINAL // MEDIAN HUMAN BASELINE',
    rangeMin: 211,
    rangeMax: 260,
    colorClass: 'text-zinc-200',
    badgeBg: 'bg-zinc-900',
    badgeBorder: 'border-zinc-700',
    badgeText: 'text-zinc-300',
    percentileText: 'TOP 50.0%',
    description: 'Expected physiological standard for alert adults with nominal sleep and cognitive focus.',
  },
  {
    id: 'casual',
    name: 'Casual Reflex',
    title: 'RELAXED // CASUAL REFLEX',
    rangeMin: 261,
    rangeMax: 330,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-950/70',
    badgeBorder: 'border-amber-600',
    badgeText: 'text-amber-300',
    percentileText: 'TOP 80.0%',
    description: 'Motor latency indicates relaxed attention, visual fatigue, or peripheral display refresh lag.',
  },
  {
    id: 'fatigued',
    name: 'Caffeine Deficient',
    title: 'NEURO-FATIGUE // CAFFEINE DEFICIENT',
    rangeMin: 331,
    rangeMax: 99999,
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-950/70',
    badgeBorder: 'border-rose-600',
    badgeText: 'text-rose-300',
    percentileText: 'BOTTOM 15%',
    description: 'Significant neurological delay detected. Recommended: Hydration, sleep cycle recovery, or an espresso infusion.',
  },
];

export function getArchetype(reactionMs: number): ArchetypeTier {
  for (const tier of ARCHETYPE_TIERS) {
    if (reactionMs <= tier.rangeMax) {
      return tier;
    }
  }
  return ARCHETYPE_TIERS[ARCHETYPE_TIERS.length - 1];
}

// Computes the percentile placement based on empirical human reaction distribution (Mean ~235ms, StdDev ~35ms)
export function calculatePercentile(ms: number): number {
  const mean = 235;
  const stdDev = 35;
  const z = (ms - mean) / stdDev;
  
  // Normal cumulative distribution function approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) {
    p = 1 - p;
  }
  // Convert to "Top X%"
  const topPercent = Math.max(0.1, Math.min(99.9, (1 - p) * 100));
  return topPercent;
}

export function calculateStats(scores: number[]) {
  if (scores.length === 0) {
    return { mean: 0, median: 0, best: 0, variance: 0, stdDev: 0 };
  }

  // Filter out any impossible negative or 0 scores
  const valid = scores.filter((s) => s > 0);
  if (valid.length === 0) {
    return { mean: 0, median: 0, best: 0, variance: 0, stdDev: 0 };
  }

  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / valid.length;

  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const best = sorted[0];

  const variance = valid.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / valid.length;
  const stdDev = Math.sqrt(variance);

  return { mean, median, best, variance, stdDev };
}

export function getCurrentTimeBlock(): 'morning' | 'afternoon' | 'late-night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'late-night';
  }
}

const STORAGE_KEY = 'synapse_reflex_sessions_v1';

export function loadSavedSessions(): ReactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sessions from localStorage', e);
    return [];
  }
}

export function saveSessionRecord(record: ReactionRecord): ReactionRecord[] {
  try {
    const current = loadSavedSessions();
    const updated = [record, ...current].slice(0, 100); // Keep last 100
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save session to localStorage', e);
    return [];
  }
}

export function clearSavedSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear sessions', e);
  }
}
