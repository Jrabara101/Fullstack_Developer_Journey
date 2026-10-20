import { CriticProfile, PillarBreakdown, TasteMatchResult } from '../../src/types';
import { db } from '../db/database';

export function computeTasteMatch(activeUserId: string, targetUserId: string): TasteMatchResult {
  const activeUser = db.getProfileById(activeUserId);
  const targetUser = db.getProfileById(targetUserId);

  if (!activeUser || !targetUser) {
    return {
      userId: activeUserId,
      targetUserId,
      tasteMatchPercent: 75,
      sharedGamesCount: 0,
      pillarAlignment: [],
      verdict: 'Profiles not found',
      sharedFavorites: [],
    };
  }

  // 1. Compute 5-Pillar Cosine Similarity
  const userPillars = activeUser.tasteVector || { gameplay: 4.5, narrative: 4.5, visuals: 4.5, audio: 4.5, polish: 4.5 };
  const targetPillars = targetUser.tasteVector || { gameplay: 4.5, narrative: 4.5, visuals: 4.5, audio: 4.5, polish: 4.5 };

  const uPillarVec = [userPillars.gameplay, userPillars.narrative, userPillars.visuals, userPillars.audio, userPillars.polish];
  const tPillarVec = [targetPillars.gameplay, targetPillars.narrative, targetPillars.visuals, targetPillars.audio, targetPillars.polish];

  const pillarSim = cosineSimilarity(uPillarVec, tPillarVec);

  // 2. Compute Shared Game Ratings Cosine Similarity
  const allReviews = db.getAllReviews();
  const userReviews = allReviews.filter((r) => r.author.id === activeUserId);
  const targetReviews = allReviews.filter((r) => r.author.id === targetUserId);

  const userGameMap = new Map<string, number>();
  userReviews.forEach((r) => userGameMap.set(r.gameId, r.starRating));

  const targetGameMap = new Map<string, number>();
  targetReviews.forEach((r) => targetGameMap.set(r.gameId, r.starRating));

  const sharedGameIds: string[] = [];
  const uRatingVec: number[] = [];
  const tRatingVec: number[] = [];

  userGameMap.forEach((rating, gameId) => {
    if (targetGameMap.has(gameId)) {
      sharedGameIds.push(gameId);
      uRatingVec.push(rating);
      tRatingVec.push(targetGameMap.get(gameId)!);
    }
  });

  let ratingsSim = 0.85; // baseline assumption if few shared
  if (sharedGameIds.length >= 2) {
    ratingsSim = cosineSimilarity(uRatingVec, tRatingVec);
  }

  // 3. Composite Taste Match %
  // 55% pillar alignment weight + 45% game ratings alignment
  const compositeScore = Math.max(0.4, Math.min(0.99, (pillarSim * 0.55) + (ratingsSim * 0.45)));
  const tasteMatchPercent = Math.round(compositeScore * 100);

  // Pillar alignment details
  const pillarKeys: (keyof PillarBreakdown)[] = ['gameplay', 'narrative', 'visuals', 'audio', 'polish'];
  const pillarAlignment = pillarKeys.map((p) => {
    const uW = userPillars[p];
    const tW = targetPillars[p];
    return {
      pillar: p,
      userWeight: uW,
      targetWeight: tW,
      delta: Math.round(Math.abs(uW - tW) * 10) / 10,
    };
  });

  // Find shared high-rated favorites
  const sharedFavorites = db.getGames().filter((g) => {
    const isTop4User = activeUser.topFourGameIds.includes(g.id);
    const isTop4Target = targetUser.topFourGameIds.includes(g.id);
    const inShelves = activeUser.shelves?.[g.id] && targetUser.shelves?.[g.id];
    return (isTop4User && isTop4Target) || (isTop4Target && inShelves);
  }).slice(0, 3);

  // Verdict title
  let verdict = 'Complementary Perspectives';
  if (tasteMatchPercent >= 93) {
    verdict = 'Twin Connoisseurs (Transcendent Taste Sync)';
  } else if (tasteMatchPercent >= 85) {
    verdict = 'High-Frequency Harmonic Symmetry';
  } else if (tasteMatchPercent >= 75) {
    verdict = 'Shared Canon with Divergent Focal Points';
  } else {
    verdict = 'Antithetical Ideologies (Opposite Critical Poles)';
  }

  return {
    userId: activeUserId,
    targetUserId,
    tasteMatchPercent,
    sharedGamesCount: sharedGameIds.length,
    pillarAlignment,
    verdict,
    sharedFavorites,
  };
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0) return 0.8;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0.8;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
