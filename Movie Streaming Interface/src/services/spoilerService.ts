import { MediaItem, SpoilerCheckpoint } from '../types';

export interface SpoilerRefresherResult {
  titleId: string;
  titleName: string;
  pausedMinute: number;
  progressSeconds: number;
  lastWatchedDaysAgo: number;
  activeActName: string;
  recapBullets: [string, string, string];
  spoilerSafeLockTimestamp: string;
  isLockedAhead: boolean;
  totalCheckpointsAvailable: number;
  passedCheckpointsCount: number;
}

/**
 * Spoiler-Locked Context Service
 * Retrieves only the recap bullets corresponding to the user's exact saved timestamp.
 * Future plot twists are strictly locked out.
 */
export function getSpoilerLockedRecap(item: MediaItem): SpoilerRefresherResult | null {
  if (!item.progress || !item.progress.checkpoints || item.progress.checkpoints.length === 0) {
    return null;
  }

  const { progressSeconds, lastWatchedDaysAgo, checkpoints } = item.progress;
  const pausedMinute = Math.floor(progressSeconds / 60);

  // Find all checkpoints that occurred at or before this timestamp
  const eligibleCheckpoints = checkpoints.filter(cp => cp.timestampSeconds <= progressSeconds);

  // Take the most recent reached checkpoint
  const activeCheckpoint: SpoilerCheckpoint = eligibleCheckpoints.length > 0
    ? eligibleCheckpoints[eligibleCheckpoints.length - 1]
    : checkpoints[0];

  const lockMins = Math.floor(activeCheckpoint.timestampSeconds / 60);
  const lockSecs = activeCheckpoint.timestampSeconds % 60;
  const spoilerSafeLockTimestamp = `${lockMins}:${lockSecs < 10 ? '0' : ''}${lockSecs}`;

  return {
    titleId: item.id,
    titleName: item.title,
    pausedMinute,
    progressSeconds,
    lastWatchedDaysAgo,
    activeActName: activeCheckpoint.actName,
    recapBullets: activeCheckpoint.bullets,
    spoilerSafeLockTimestamp,
    isLockedAhead: true,
    totalCheckpointsAvailable: checkpoints.length,
    passedCheckpointsCount: eligibleCheckpoints.length
  };
}

