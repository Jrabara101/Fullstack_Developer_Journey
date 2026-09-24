import { DailyStats, DeductionArchetype } from '../types/game';
import { getTodayDateString } from './prng';

const STORAGE_KEY = 'THE_VAULT_STATS_V1';

const DEFAULT_STATS: DailyStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  },
  lastPlayedDate: '',
  history: [],
};

export function loadVaultStats(): DailyStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      guessDistribution: {
        ...DEFAULT_STATS.guessDistribution,
        ...(parsed.guessDistribution || {}),
      },
    };
  } catch (e) {
    console.error('Failed to parse vault stats from storage:', e);
    return DEFAULT_STATS;
  }
}

export function saveVaultStats(stats: DailyStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save vault stats to storage:', e);
  }
}

export function recordGameResult(
  won: boolean,
  attemptsUsed: number,
  score: number,
  target: number,
  archetype: DeductionArchetype,
  isDaily: boolean
): DailyStats {
  const current = loadVaultStats();
  const today = getTodayDateString();

  const newPlayed = current.played + 1;
  const newWins = won ? current.wins + 1 : current.wins;

  let newCurrentStreak = current.currentStreak;
  let newMaxStreak = current.maxStreak;

  if (isDaily) {
    if (won) {
      newCurrentStreak += 1;
      if (newCurrentStreak > newMaxStreak) {
        newMaxStreak = newCurrentStreak;
      }
    } else {
      newCurrentStreak = 0;
    }
  }

  const newDist = { ...current.guessDistribution };
  if (won && attemptsUsed >= 1 && attemptsUsed <= 7) {
    newDist[attemptsUsed] = (newDist[attemptsUsed] || 0) + 1;
  }

  const updated: DailyStats = {
    played: newPlayed,
    wins: newWins,
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    guessDistribution: newDist,
    lastPlayedDate: today,
    history: [
      {
        date: today,
        attempts: attemptsUsed,
        won,
        score,
        target,
        archetype,
      },
      ...current.history.slice(0, 49), // retain last 50 games
    ],
  };

  saveVaultStats(updated);
  return updated;
}

export function hasCompletedDailyToday(): boolean {
  if (typeof window === 'undefined') return false;
  const stats = loadVaultStats();
  const today = getTodayDateString();
  return (
    stats.lastPlayedDate === today &&
    stats.history.some((h) => h.date === today && h.won)
  );
}
