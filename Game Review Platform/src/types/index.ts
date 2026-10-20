export type ShelfStatus = 'PLAYING' | 'BEATEN' | 'MASTERED_100' | 'DROPPED' | 'BACKLOG' | 'WISHLIST';

export interface PillarBreakdown {
  gameplay: number;    // 1 - 5
  narrative: number;   // 1 - 5
  visuals: number;     // 1 - 5
  audio: number;       // 1 - 5
  polish: number;      // 1 - 5
}

export type GamingPlatform = 'PC' | 'PS5' | 'XBOX' | 'SWITCH' | 'DECK';

export interface PlaytimeSentimentBracket {
  bracket: string;       // e.g., "< 5 hrs", "5-15 hrs", "15-40 hrs", "40-80 hrs", "80+ hrs"
  minHours: number;
  maxHours: number;
  ratingAvg: number;
  sampleCount: number;
  dropRatePercent: number; // Percentage of players who dropped in this bracket
  sentimentSummary: string;
}

export interface GameCatalogItem {
  id: string;
  slug: string;
  title: string;
  developer: string;
  publisher?: string;
  releaseYear: number;
  platforms: GamingPlatform[];
  coverUrl: string;
  backdropUrl: string;
  genres: string[];
  tagline?: string;
  synopsis?: string;
  metrics: {
    averageRating: number;       // 0.5 - 5.0 scale
    totalReviews: number;
    completionRatePercent: number;
    medianHoursToBeat: number;
    communityPillars: PillarBreakdown;
    ratingHistogram: number[];   // 10 buckets from 0.5 to 5.0
  };
  playtimeHorizon?: PlaytimeSentimentBracket[];
  anomaly?: {
    isAnomalous: boolean;
    zScore: number;
    quarantinedCount: number;
    patchVersion: string;
  };
}

export interface GameReview {
  id: string;
  gameId: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
    criticTier: 'NOVICE' | 'VETERAN' | 'TOP_CRITIC';
    tasteMatchPercent?: number;
  };
  starRating: number;            // 0.5 to 5.0 in 0.5 steps
  isMasterpiece: boolean;        // Crown/Heart badge
  pillars: PillarBreakdown;
  completionStatus: ShelfStatus;
  playtimeHours: number;
  platformPlayed: string;
  patchVersion: string;
  bodyMarkdown: string;          // Supports >!spoiler!< syntax
  likedCount: number;
  createdAt: string;
  isFlaggedBrigade?: boolean;
}

export interface CriticProfile {
  id: string;
  username: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  criticTier: 'NOVICE' | 'VETERAN' | 'TOP_CRITIC';
  topFourGameIds: [string, string, string, string];
  stats: {
    totalGamesLogged: number;
    totalReviewsWritten: number;
    hoursLoggedThisYear: number;
    meanRating: number;
    signaturePillar: keyof PillarBreakdown;
  };
  activityHeatmap: { date: string; hoursPlayed: number; reviewCount: number }[];
  shelves?: Record<string, ShelfStatus>; // gameId -> ShelfStatus
  tasteVector?: PillarBreakdown;
}

export interface QuestList {
  id: string;
  title: string;
  description: string;
  curator: {
    id: string;
    username: string;
    avatarUrl: string;
    criticTier: 'NOVICE' | 'VETERAN' | 'TOP_CRITIC';
  };
  gameIds: string[];
  notes: Record<string, string>;
  likesCount: number;
  tags: string[];
  createdAt: string;
}

export interface TasteMatchResult {
  userId: string;
  targetUserId: string;
  tasteMatchPercent: number; // 0 - 100
  sharedGamesCount: number;
  pillarAlignment: {
    pillar: keyof PillarBreakdown;
    userWeight: number;
    targetWeight: number;
    delta: number;
  }[];
  verdict: string;
  sharedFavorites: GameCatalogItem[];
}

export interface AntiBrigadeReport {
  gameId: string;
  gameTitle: string;
  activeQuarantine: boolean;
  totalSubmissions: number;
  flaggedSpikes: {
    patchVersion: string;
    timeBucket: string;
    count: number;
    meanRating: number;
    zScore: number;
    status: 'NORMAL' | 'SURGE_FLAGGED' | 'QUARANTINED';
  }[];
  organicRating: number;
  unfilteredRating: number;
  recommendation: string;
}
