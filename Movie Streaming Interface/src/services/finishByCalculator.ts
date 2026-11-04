/**
 * Real-Time "Finish-By" & Binge Calculator Engine
 * Calculates exact completion times based on system clock and remaining runtime.
 */

export interface FinishCalculation {
  finishTimestamp: Date;
  finishTimeFormatted: string; // e.g. "10:45 PM"
  durationFormatted: string;   // e.g. "2h 14m" or "48m"
  remainingFormatted: string;  // e.g. "38m left"
  fullContextString: string;   // e.g. "2h 14m • Finish by 10:45 PM"
  isTomorrow: boolean;
}

export interface BingeCalculation {
  totalMinutesLeft: number;
  totalDurationFormatted: string; // e.g. "2h 10m"
  finishTimestamp: Date;
  finishTimeFormatted: string;
  summaryString: string;          // e.g. "3 episodes left • 2h 10m total • Finish by 11:17 PM"
}

/**
 * Formats minutes into human-readable duration (e.g. 134 -> "2h 14m", 45 -> "45m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * Formats a Date object into a readable time string (e.g. "10:45 PM")
 */
export function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Calculates finish time given duration and optional progress offset
 */
export function calculateFinishTime(
  totalDurationMinutes: number,
  progressSeconds: number = 0,
  referenceDate: Date = new Date()
): FinishCalculation {
  const elapsedMinutes = Math.floor(progressSeconds / 60);
  const remainingMinutes = Math.max(1, totalDurationMinutes - elapsedMinutes);

  const finishTimestamp = new Date(referenceDate.getTime() + remainingMinutes * 60 * 1000);
  const finishTimeFormatted = formatTimeOfDay(finishTimestamp);
  const durationFormatted = formatDuration(totalDurationMinutes);
  const remainingFormatted = elapsedMinutes > 0 ? `${formatDuration(remainingMinutes)} left` : durationFormatted;

  const isTomorrow = finishTimestamp.getDate() !== referenceDate.getDate();
  const timeQualifier = isTomorrow ? `${finishTimeFormatted} tomorrow` : finishTimeFormatted;

  const fullContextString = elapsedMinutes > 0
    ? `${remainingFormatted} • Finish by ${timeQualifier}`
    : `${durationFormatted} • Finish by ${timeQualifier}`;

  return {
    finishTimestamp,
    finishTimeFormatted: timeQualifier,
    durationFormatted,
    remainingFormatted,
    fullContextString,
    isTomorrow
  };
}

/**
 * Calculates series binge completion time for multi-episode runs
 */
export function calculateBingeTime(
  episodesLeft: number,
  avgEpisodeMinutes: number,
  currentProgressSeconds: number = 0,
  referenceDate: Date = new Date()
): BingeCalculation {
  const currentEpRemainingMinutes = Math.max(0, avgEpisodeMinutes - Math.floor(currentProgressSeconds / 60));
  const otherEpisodesMinutes = Math.max(0, episodesLeft - 1) * avgEpisodeMinutes;
  const totalMinutesLeft = currentEpRemainingMinutes + otherEpisodesMinutes;

  const finishTimestamp = new Date(referenceDate.getTime() + totalMinutesLeft * 60 * 1000);
  const finishTimeFormatted = formatTimeOfDay(finishTimestamp);
  const totalDurationFormatted = formatDuration(totalMinutesLeft);

  const isTomorrow = finishTimestamp.getDate() !== referenceDate.getDate();
  const timeQualifier = isTomorrow ? `${finishTimeFormatted} tomorrow` : finishTimeFormatted;

  const summaryString = `${episodesLeft} ${episodesLeft === 1 ? 'ep' : 'eps'} left • ${totalDurationFormatted} total • Finish by ${timeQualifier}`;

  return {
    totalMinutesLeft,
    totalDurationFormatted,
    finishTimestamp,
    finishTimeFormatted: timeQualifier,
    summaryString
  };
}

/**
 * Aggregates runtime for Tonight's Shortlist Queue
 */
export function calculateShortlistQueueTime(
  durationsInMinutes: number[],
  referenceDate: Date = new Date()
): { totalCount: number; totalMinutes: number; totalDurationFormatted: string; finishTimeFormatted: string } {
  const totalCount = durationsInMinutes.length;
  const totalMinutes = durationsInMinutes.reduce((sum, d) => sum + d, 0);
  const finishTimestamp = new Date(referenceDate.getTime() + totalMinutes * 60 * 1000);
  const finishTimeFormatted = formatTimeOfDay(finishTimestamp);
  const totalDurationFormatted = formatDuration(totalMinutes);

  return {
    totalCount,
    totalMinutes,
    totalDurationFormatted,
    finishTimeFormatted
  };
}

