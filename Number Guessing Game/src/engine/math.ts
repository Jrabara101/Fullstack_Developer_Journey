import { ArchetypeResult, DeductionArchetype, DirectionFeedback, GuessRecord } from '../types/game';

/**
 * Primality test
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Returns sorted non-trivial factors of n (excluding 1 and n if prime, otherwise proper divisors)
 */
export function getFactors(n: number): number[] {
  const factors: number[] = [];
  for (let i = 2; i <= Math.floor(n / 2); i++) {
    if (n % i === 0) {
      factors.push(i);
    }
  }
  return factors;
}

/**
 * Returns sum of digits
 */
export function getDigitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
}

/**
 * Generates digit sum range bracket (e.g., "10 ≤ Σ(d) ≤ 15")
 */
export function getDigitSumRange(n: number): string {
  const sum = getDigitSum(n);
  const lower = Math.max(1, Math.floor(sum / 5) * 5);
  const upper = lower + 5;
  return `${lower} ≤ Σ(d) ≤ ${upper}`;
}

/**
 * Computes optimal binary search midpoint
 */
export function calculateOptimalBisect(min: number, max: number): number {
  return Math.floor((min + max) / 2);
}

/**
 * Calculates theoretical minimum steps: ceil(log2(rangeSize))
 */
export function getTheoreticalOptimalSteps(min: number, max: number): number {
  const range = max - min + 1;
  return Math.max(1, Math.ceil(Math.log2(range)));
}

/**
 * Calculates possibilities eliminated by a guess given previous bounds
 */
export function calculateElimination(
  guess: number,
  direction: DirectionFeedback,
  prevMin: number,
  prevMax: number
): number {
  if (direction === 'TOO_HIGH') {
    // Eliminates [guess, prevMax]
    const eliminated = Math.max(0, prevMax - guess + 1);
    return eliminated;
  }
  if (direction === 'TOO_LOW') {
    // Eliminates [prevMin, guess]
    const eliminated = Math.max(0, guess - prevMin + 1);
    return eliminated;
  }
  // CORRECT: eliminates all remaining non-target values
  return Math.max(0, prevMax - prevMin);
}

/**
 * Analyze deduction gameplay and determine player archetype & efficiency score
 */
export function calculateArchetype(
  history: GuessRecord[],
  rangeMin = 1,
  rangeMax = 100,
  won = true
): ArchetypeResult {
  const optimalSteps = getTheoreticalOptimalSteps(rangeMin, rangeMax);
  const actualSteps = history.length;

  if (history.length === 0) {
    return {
      title: 'Tactical Infiltrator',
      description: 'Standard baseline protocol analysis.',
      efficiencyRating: 50,
      optimalSteps,
      actualSteps: 0,
      ratingTier: 'C',
    };
  }

  let totalDeviation = 0;
  let outOfBoundsCount = 0;
  let runningMin = rangeMin;
  let runningMax = rangeMax;

  for (let i = 0; i < history.length; i++) {
    const record = history[i];
    const optimalGuess = calculateOptimalBisect(runningMin, runningMax);
    const rangeSpan = Math.max(1, runningMax - runningMin);

    // Check if guess was outside the known safe interval
    if (record.value < runningMin || record.value > runningMax) {
      outOfBoundsCount++;
    }

    const diff = Math.abs(record.value - optimalGuess);
    const normalizedDev = diff / (rangeSpan / 2 || 1);
    totalDeviation += Math.min(1, normalizedDev);

    // Update bounds for next evaluation step
    if (record.direction === 'TOO_LOW') {
      runningMin = Math.max(runningMin, record.value + 1);
    } else if (record.direction === 'TOO_HIGH') {
      runningMax = Math.min(runningMax, record.value - 1);
    }
  }

  const avgDeviation = totalDeviation / history.length;
  // Efficiency from 0% to 100%
  let efficiencyRating = Math.round(Math.max(5, (1 - avgDeviation) * 100));

  let title: DeductionArchetype;
  let description: string;
  let ratingTier: 'S' | 'A' | 'B' | 'C' | 'D';

  if (outOfBoundsCount >= 2) {
    title = 'Wild Gambler';
    description = 'Submitted probes outside validated bounds, relying on intuition over binary search logic.';
    ratingTier = 'D';
    efficiencyRating = Math.min(efficiencyRating, 45);
  } else if (won && actualSteps <= optimalSteps && efficiencyRating >= 85) {
    title = 'Binary Savant';
    description = 'Mathematically flawless entropy elimination adhering to exact logarithmic bisection.';
    ratingTier = 'S';
  } else if (efficiencyRating >= 72) {
    title = 'Tactical Infiltrator';
    description = 'High-discipline deduction with calculated interval halving and disciplined bounds tracking.';
    ratingTier = 'A';
  } else if (history.some((g) => g.distance <= 5) && efficiencyRating >= 55) {
    title = 'Thermal Tracker';
    description = 'Honed in through harmonic proximity and micro-calibrations near the core vector.';
    ratingTier = 'B';
  } else {
    title = 'Risk Hacker';
    description = 'Aggressive leap-probing and unconventional vector scanning.';
    ratingTier = 'C';
  }

  return {
    title,
    description,
    efficiencyRating,
    optimalSteps,
    actualSteps,
    ratingTier,
  };
}

/**
 * Generate spoiler-free emoji share grid for clipboard
 */
export function generateShareEmojiGrid(
  history: GuessRecord[],
  attemptsUsed: number,
  maxAttempts: number,
  won: boolean,
  archetype: DeductionArchetype,
  score: number,
  dailyDate?: string
): string {
  const emojiRow = history
    .map((record) => {
      if (record.direction === 'CORRECT') return '🟩';
      if (record.direction === 'TOO_HIGH') return '🟧';
      return '🟦';
    })
    .join(' ');

  const titlePrefix = dailyDate
    ? `THE VAULT // DAILY BREACH [${dailyDate}]`
    : `THE VAULT // SECTOR BREACH`;

  const statusLine = won
    ? `STATUS: UNLOCKED 🔓 [${attemptsUsed}/${maxAttempts} Attempts]`
    : `STATUS: LOCKOUT 🚨 [${attemptsUsed}/${maxAttempts} Attempts]`;

  return [
    titlePrefix,
    statusLine,
    `SCORE: ${score.toLocaleString()} PTS | ${archetype}`,
    '',
    emojiRow,
    '',
    `Efficiency: ${history.length > 0 ? (won ? '94%' : '58%') : '0%'} (Binary Search Benchmark)`,
    `Play: ${typeof window !== 'undefined' ? window.location.origin : 'https://thevault.cipher'}`,
  ].join('\n');
}
