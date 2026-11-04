import { MediaItem, UserProfile } from '../types';
import { HOUSEHOLD_PROFILES } from '../data/mockData';

export interface MultiProfileScoreResult {
  title: MediaItem;
  jointScore: number;
  breakdown: Record<string, number>; // profileId -> score
  isCompromise: boolean;
  filterReason?: string;
  overlapTag: string;
}

export interface BlenderSynthesis {
  activeProfiles: UserProfile[];
  profileNamesFormatted: string; // e.g. "Alex + Sam"
  blendedTitles: MultiProfileScoreResult[];
  consensusAverage: number;
  synthesisNote: string;
  filteredWatchedCount: number;
}

/**
 * Computes the joint match score for a given title across multiple profiles.
 * Uses harmonic mean / geometric balance with a polarization penalty.
 * If one person rates it 98% and another rates it 30%, it drops significantly,
 * favoring titles both genuinely enjoy (e.g. 92% and 88% -> 90% Joint Score).
 */
export function calculateJointMatch(
  title: MediaItem,
  selectedProfiles: UserProfile[]
): { jointScore: number; breakdown: Record<string, number>; isCompromise: boolean; overlapTag: string } {
  if (selectedProfiles.length === 0) {
    return { jointScore: 85, breakdown: {}, isCompromise: false, overlapTag: 'General Match' };
  }

  if (selectedProfiles.length === 1) {
    const single = selectedProfiles[0];
    const score = title.matchScores[single.id] || 80;
    return {
      jointScore: score,
      breakdown: { [single.id]: score },
      isCompromise: false,
      overlapTag: `${single.name}'s Top Match`
    };
  }

  const breakdown: Record<string, number> = {};
  const scores: number[] = [];

  for (const profile of selectedProfiles) {
    const s = title.matchScores[profile.id] || 75;
    breakdown[profile.id] = s;
    scores.push(s);
  }

  // Calculate geometric balance & min/max spread
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const spread = maxScore - minScore;

  // Average score
  const rawAvg = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Polarization penalty: if spread > 30, penalize by spread * 0.25 to prevent one person being miserable
  const penalty = spread > 25 ? (spread - 25) * 0.28 : 0;
  const jointScore = Math.round(Math.max(40, Math.min(99, rawAvg - penalty)));

  const isCompromise = spread > 20;

  let overlapTag = 'High Consensus';
  if (minScore >= 88) {
    overlapTag = 'Perfect Co-Watch';
  } else if (isCompromise) {
    overlapTag = 'Taste Compromise';
  } else {
    overlapTag = 'Harmonious Pick';
  }

  return {
    jointScore,
    breakdown,
    isCompromise,
    overlapTag
  };
}

/**
 * Executes full taste intersection across active profile IDs
 */
export function executeTasteIntersection(
  activeProfileIds: string[],
  catalog: MediaItem[]
): BlenderSynthesis {
  const activeProfiles = HOUSEHOLD_PROFILES.filter(p => activeProfileIds.includes(p.id));

  if (activeProfiles.length === 0) {
    const defaultProfile = HOUSEHOLD_PROFILES[0];
    return executeTasteIntersection([defaultProfile.id], catalog);
  }

  const profileNamesFormatted = activeProfiles.map(p => p.name).join(' + ');

  // Collect all watched IDs across selected profiles
  const allWatchedIds = new Set<string>();
  activeProfiles.forEach(p => p.watchedIds.forEach(id => allWatchedIds.add(id)));

  const filteredTitles: MultiProfileScoreResult[] = [];
  let filteredWatchedCount = 0;

  for (const item of catalog) {
    // If co-watching, do not show items either has already finished (unless it's currently in progress)
    if (activeProfiles.length > 1 && allWatchedIds.has(item.id) && !item.progress) {
      filteredWatchedCount++;
      continue;
    }

    const { jointScore, breakdown, isCompromise, overlapTag } = calculateJointMatch(item, activeProfiles);

    filteredTitles.push({
      title: item,
      jointScore,
      breakdown,
      isCompromise,
      overlapTag
    });
  }

  // Sort descending by joint score
  filteredTitles.sort((a, b) => b.jointScore - a.jointScore);

  const consensusAverage = Math.round(
    filteredTitles.slice(0, 5).reduce((sum, item) => sum + item.jointScore, 0) / Math.min(5, filteredTitles.length)
  );

  // Generate intelligent editorial synthesis note
  let synthesisNote = '';
  if (activeProfiles.length === 1) {
    synthesisNote = `Personalized for ${activeProfiles[0].name}: Prioritizing ${activeProfiles[0].preferences.favoriteGenres.join(', ')}.`;
  } else if (activeProfiles.length === 2) {
    const [p1, p2] = activeProfiles;
    synthesisNote = `Blends ${p1.name}'s taste for ${p1.preferences.favoriteGenres[0]} with ${p2.name}'s love for ${p2.preferences.favoriteGenres[0]}. Filtered out ${filteredWatchedCount} titles already seen by either of you.`;
  } else {
    synthesisNote = `Group compromise for ${profileNamesFormatted}. Surfacing high-consensus hits with low polarization and broad household appeal.`;
  }

  return {
    activeProfiles,
    profileNamesFormatted,
    blendedTitles: filteredTitles,
    consensusAverage,
    synthesisNote,
    filteredWatchedCount
  };
}

