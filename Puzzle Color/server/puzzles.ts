import { ColorData, createColorData, mixSubtractiveKubelkaMunk, mixAdditiveOptics } from './colorimetry';

// Mulberry32 PRNG
export class Mulberry32 {
  private state: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
      }
      this.state = hash >>> 0;
    } else {
      this.state = seed >>> 0;
    }
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  difficulty: 'Apprentice' | 'Chemist' | 'Optic Master';
  mode: 'SUBTRACTIVE_CMYK' | 'ADDITIVE_RGB';
  targetColor: ColorData;
  toleranceThreshold: number;
  maxMoves: number;
  maxCapacityMl: number;
  dailySeed?: string;
}

// Generate Daily Master Swatch based on ISO date
export function getDailyPuzzle(dateStr: string): PuzzleDefinition {
  const prng = new Mulberry32(`${dateStr}-master-swatch`);
  const isSubtractive = prng.range(0, 10) > 3; // 70% subtractive pigment, 30% additive light

  if (isSubtractive) {
    const drops = {
      cyan: prng.range(1, 5) * 0.5,
      magenta: prng.range(1, 6) * 0.5,
      yellow: prng.range(0, 4) * 0.5,
      carbon: prng.range(0, 2) * 0.5,
      titanium: prng.range(0, 2) * 0.5,
    };
    const target = mixSubtractiveKubelkaMunk(drops, 10.0);

    return {
      id: `DAILY-${dateStr}`,
      title: `Daily Master Swatch #${dateStr}`,
      difficulty: 'Chemist',
      mode: 'SUBTRACTIVE_CMYK',
      targetColor: target,
      toleranceThreshold: 2.0,
      maxMoves: 10,
      maxCapacityMl: 50.0,
      dailySeed: dateStr,
    };
  } else {
    const red = prng.range(2, 12) * 0.5;
    const green = prng.range(2, 12) * 0.5;
    const blue = prng.range(2, 12) * 0.5;
    const target = mixAdditiveOptics({ red, green, blue });

    return {
      id: `DAILY-${dateStr}`,
      title: `Daily Master Photon #${dateStr}`,
      difficulty: 'Optic Master',
      mode: 'ADDITIVE_RGB',
      targetColor: target,
      toleranceThreshold: 2.0,
      maxMoves: 8,
      maxCapacityMl: 30.0,
      dailySeed: dateStr,
    };
  }
}

// Curated puzzle catalog
export const CURATED_PUZZLES: Record<string, PuzzleDefinition> = {
  'chapter-1-sunset': {
    id: 'chapter-1-sunset',
    title: 'Chapter I: Orchid Twilight',
    difficulty: 'Apprentice',
    mode: 'SUBTRACTIVE_CMYK',
    targetColor: createColorData(154, 52, 142),
    toleranceThreshold: 2.2,
    maxMoves: 8,
    maxCapacityMl: 50.0,
  },
  'chapter-2-viridian': {
    id: 'chapter-2-viridian',
    title: 'Chapter II: Deep Viridian',
    difficulty: 'Chemist',
    mode: 'SUBTRACTIVE_CMYK',
    targetColor: createColorData(22, 138, 105),
    toleranceThreshold: 1.8,
    maxMoves: 9,
    maxCapacityMl: 50.0,
  },
  'chapter-3-prism': {
    id: 'chapter-3-prism',
    title: 'Chapter III: White Light Synthesis',
    difficulty: 'Optic Master',
    mode: 'ADDITIVE_RGB',
    targetColor: createColorData(240, 242, 245),
    toleranceThreshold: 1.5,
    maxMoves: 6,
    maxCapacityMl: 30.0,
  },
};
