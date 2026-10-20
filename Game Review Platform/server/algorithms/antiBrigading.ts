import { AntiBrigadeReport, GameReview } from '../../src/types';
import { db } from '../db/database';

export function analyzeAntiBrigading(gameId: string): AntiBrigadeReport {
  const game = db.getGameById(gameId);
  const allGameReviews = db.getAllReviews().filter((r) => r.gameId === gameId);

  if (!game || allGameReviews.length === 0) {
    return {
      gameId,
      gameTitle: game ? game.title : 'Unknown Game',
      activeQuarantine: false,
      totalSubmissions: 0,
      flaggedSpikes: [],
      organicRating: 4.5,
      unfilteredRating: 4.5,
      recommendation: 'Insufficient data for telemetry verification.',
    };
  }

  // Group by patchVersion
  const patchBuckets = new Map<string, GameReview[]>();
  allGameReviews.forEach((r) => {
    const patch = r.patchVersion || 'v1.0';
    if (!patchBuckets.has(patch)) {
      patchBuckets.set(patch, []);
    }
    patchBuckets.get(patch)!.push(r);
  });

  // Calculate baseline stats
  const bucketCounts: number[] = [];
  patchBuckets.forEach((revs) => bucketCounts.push(revs.length));

  const meanVelocity = bucketCounts.reduce((a, b) => a + b, 0) / bucketCounts.length;
  const variance = bucketCounts.reduce((acc, count) => acc + Math.pow(count - meanVelocity, 2), 0) / (bucketCounts.length || 1);
  const stdDev = Math.sqrt(variance) || 1.5;

  const rawSum = allGameReviews.reduce((acc, r) => acc + r.starRating, 0);
  const unfilteredRating = Math.round((rawSum / allGameReviews.length) * 10) / 10;

  const flaggedSpikes: AntiBrigadeReport['flaggedSpikes'] = [];
  let isQuarantineActiveAny = false;

  patchBuckets.forEach((revs, patch) => {
    const count = revs.length;
    const bucketMean = revs.reduce((a, b) => a + b.starRating, 0) / count;
    const zScore = Math.round(((count - meanVelocity) / stdDev) * 100) / 100;
    
    // Check if review velocity is >3 std devs, or if there is an explicit brigade flag
    const hasBrigadeFlag = revs.some((r) => r.isFlaggedBrigade);
    const isAnomalous = zScore >= 3.0 || hasBrigadeFlag;
    const isQuarantined = db.isPatchQuarantined(gameId, patch);

    if (isQuarantined) {
      isQuarantineActiveAny = true;
    }

    let status: 'NORMAL' | 'SURGE_FLAGGED' | 'QUARANTINED' = 'NORMAL';
    if (isQuarantined) {
      status = 'QUARANTINED';
    } else if (isAnomalous) {
      status = 'SURGE_FLAGGED';
    }

    flaggedSpikes.push({
      patchVersion: patch,
      timeBucket: `Patch Window (${patch})`,
      count,
      meanRating: Math.round(bucketMean * 10) / 10,
      zScore,
      status,
    });
  });

  // Calculate organic rating by excluding quarantined reviews
  const organicReviews = db.getReviewsForGame(gameId, false);
  const organicSum = organicReviews.reduce((acc, r) => acc + r.starRating, 0);
  const organicRating = organicReviews.length > 0
    ? Math.round((organicSum / organicReviews.length) * 10) / 10
    : unfilteredRating;

  let recommendation = 'Rating velocity within normative distribution parameters.';
  if (isQuarantineActiveAny) {
    recommendation = `Quarantine active: Anomaly filter isolated ${allGameReviews.length - organicReviews.length} brigade reviews. Aggregate score restored from ${unfilteredRating}★ to ${organicRating}★.`;
  } else if (flaggedSpikes.some((s) => s.status === 'SURGE_FLAGGED')) {
    recommendation = 'Velocity surge detected (>3 standard deviations). Verification algorithm recommends quarantine to protect rating integrity.';
  }

  return {
    gameId,
    gameTitle: game.title,
    activeQuarantine: isQuarantineActiveAny,
    totalSubmissions: allGameReviews.length,
    flaggedSpikes,
    organicRating,
    unfilteredRating,
    recommendation,
  };
}
