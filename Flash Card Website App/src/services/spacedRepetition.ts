import { Flashcard, MemoryStatus } from '../types/flashcards';

export interface SpacedRepetitionResult {
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapseCount: number;
  nextReviewAt: number;
}

export class SpacedRepetitionEngine {
  // Grades:
  // 1 = Again / Lapsed (Hard failure - reset interval)
  // 2 = Hard (Pass with difficulty)
  // 3 = Good (Normal recall)
  // 4 = Mastered / Easy (Immediate effortless recall)
  static calculateNextReview(
    card: Flashcard,
    grade: 1 | 2 | 3 | 4,
    responseSpeedMs: number = 3000
  ): SpacedRepetitionResult {
    let { intervalDays, easeFactor, repetitionCount, lapseCount } = card;

    // Minimum ease factor is 1.3
    if (!easeFactor || easeFactor < 1.3) easeFactor = 2.5;
    if (intervalDays === undefined) intervalDays = 0;
    if (repetitionCount === undefined) repetitionCount = 0;
    if (lapseCount === undefined) lapseCount = 0;

    // Speed bonus/penalty: fast response (< 2s) rewards confidence; very slow (> 12s) penalizes
    const speedFactor = responseSpeedMs < 2000 ? 1.05 : responseSpeedMs > 10000 ? 0.95 : 1.0;

    if (grade === 1) {
      // Lapse: user forgot
      repetitionCount = 0;
      lapseCount += 1;
      // Interval resets to 10 minutes (0.007 days) or 1 day
      intervalDays = 0.007; // ~10 minutes
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
      // Successful recall
      if (repetitionCount === 0) {
        intervalDays = grade === 4 ? 2 : 1;
      } else if (repetitionCount === 1) {
        intervalDays = grade === 4 ? 5 : 3;
      } else {
        // SM-2 modified
        let multiplier = easeFactor * speedFactor;
        if (grade === 2) multiplier *= 0.85;
        if (grade === 4) multiplier *= 1.3;

        intervalDays = Math.max(1, Math.round(intervalDays * multiplier));
      }

      // Update Ease Factor
      // EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      const q = grade + 1; // Map 1..4 to SM-2's 2..5 range
      easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      easeFactor = Math.max(1.3, Math.min(3.0, easeFactor));
      repetitionCount += 1;
    }

    const now = Date.now();
    const nextReviewAt = Math.round(now + intervalDays * 24 * 60 * 60 * 1000);

    return {
      intervalDays,
      easeFactor,
      repetitionCount,
      lapseCount,
      nextReviewAt,
    };
  }

  // Calculate memory retention rate (0 to 100%) using Ebbinghaus exponential decay
  static calculateRetention(card: Flashcard, now: number = Date.now()): number {
    if (!card.lastReviewedAt) {
      return 100; // Unstudied cards start fresh
    }

    const elapsedDays = Math.max(0, (now - card.lastReviewedAt) / (1000 * 60 * 60 * 24));
    const targetInterval = Math.max(0.1, card.intervalDays || 1);

    // Ebbinghaus decay model: R = e^(-elapsed / S), where S is stability based on interval
    const decayRate = 0.5 / targetInterval;
    const retention = Math.exp(-decayRate * elapsedDays) * 100;

    return Math.max(5, Math.min(100, Math.round(retention)));
  }

  // Determine semantic color and status
  static getMemoryStatus(card: Flashcard, now: number = Date.now()): {
    status: MemoryStatus;
    retention: number;
    color: string;
    label: string;
  } {
    const retention = this.calculateRetention(card, now);

    if (retention >= 80) {
      return {
        status: 'fresh',
        retention,
        color: '#10B981', // Emerald
        label: 'Mastered / Fresh',
      };
    } else if (retention >= 50) {
      return {
        status: 'fading',
        retention,
        color: '#F59E0B', // Warm Amber
        label: 'Review Soon / Fading',
      };
    } else {
      return {
        status: 'lapsed',
        retention,
        color: '#F43F5E', // Coral Rose
        label: 'Lapsed / Critical',
      };
    }
  }

  // Calculate deck overall health (0-100%)
  static getDeckHealth(cards: Flashcard[], now: number = Date.now()) {
    if (!cards || cards.length === 0) return { score: 100, freshCount: 0, fadingCount: 0, lapsedCount: 0 };

    let totalRetention = 0;
    let freshCount = 0;
    let fadingCount = 0;
    let lapsedCount = 0;

    cards.forEach((card) => {
      const { status, retention } = this.getMemoryStatus(card, now);
      totalRetention += retention;
      if (status === 'fresh') freshCount++;
      else if (status === 'fading') fadingCount++;
      else lapsedCount++;
    });

    const score = Math.round(totalRetention / cards.length);
    return { score, freshCount, fadingCount, lapsedCount };
  }
}

