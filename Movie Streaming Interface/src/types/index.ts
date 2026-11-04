export type MediaType = 'movie' | 'series';

export type CognitiveLoad = 
  | 'Background-Friendly'
  | 'Light Focus'
  | 'Requires Full Attention'
  | 'Subtitles Recommended';

export type TimeBucket = 'under30' | 'under90' | 'fullNight';

export type MoodCategory = 
  | 'laugh' 
  | 'cozy' 
  | 'mind-bending' 
  | 'adrenaline' 
  | 'background' 
  | 'prestige';

export interface SpoilerCheckpoint {
  timestampSeconds: number;
  actName: string;
  bullets: [string, string, string];
}

export interface PacingProfile {
  dialogueVsAction: number; // 0 (100% action) to 100 (100% dialogue)
  tensionCurve: number[]; // e.g. [30, 45, 75, 60, 95]
  intensityLevel: 'Gentle' | 'Moderate' | 'Intense' | 'Relentless';
  pacingNote: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  tagline: string;
  editorialHook: string; // "Why Watch Tonight"
  synopsis: string;
  backdropUrl: string;
  videoPreviewUrl?: string; // Optional direct video URL
  dominantColor: string; // Ambient glow color, e.g. "#3B82F6"
  durationMinutes: number;
  totalEpisodes?: number;
  releaseYear: number;
  maturityRating: 'G' | 'PG' | 'PG-13' | '16+' | '18+' | 'TV-MA';
  pacingTags: string[];
  cognitiveLoad: CognitiveLoad;
  categories: string[];
  timeBucket: TimeBucket;
  moods: MoodCategory[];
  isTop10?: number; // 1-10 rank if in top 10
  cast: string[];
  director: string;
  matchScores: Record<string, number>; // profileId -> percentage (0-100)
  matchReason: string;
  criticScore: number; // 0-100
  audienceScore: number; // 0-100
  pacingProfile: PacingProfile;
  // Progress & Recap if partially watched
  progress?: {
    progressSeconds: number;
    lastWatchedDaysAgo: number;
    currentEpisode?: string;
    totalEpisodes?: number;
    episodesLeft?: number;
    checkpoints: SpoilerCheckpoint[];
  };
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  bio: string;
  preferences: {
    favoriteGenres: string[];
    preferredPacing: string[];
    typicalCognitiveLoad: CognitiveLoad;
  };
  watchedIds: string[];
}

export interface HouseholdBlenderResult {
  activeProfileIds: string[];
  profiles: UserProfile[];
  jointMatchScore: number;
  compromiseSummary: string;
  recommendedCategory: string;
}

export interface FilterState {
  timeBucket: TimeBucket | 'all';
  mood: MoodCategory | 'all';
  searchQuery: string;
}

export interface SimulatedTimeSlot {
  label: string;
  description: string;
  hour: number;
  isWeekend: boolean;
  idealCategory: string;
}

