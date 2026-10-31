export type EngineType = 'Unity' | 'Godot' | 'Unreal' | 'WebGL / TypeScript' | 'Custom C++ / Rust';
export type DisciplineTag = 'Gameplay Systems' | 'Technical Art' | 'AI & Pathfinding' | 'Multiplayer Netcode' | 'UI / UX Architecture';

export interface TrailerChapter {
  id: string;
  title: string;
  timestampSec: number;
  description: string;
}

export interface MechanicBreakdown {
  id: string;
  title: string;
  summary: string;
  discipline: DisciplineTag;
  greyboxMediaUrl: string;
  polishedMediaUrl: string;
  interactiveParams: {
    key: string;
    label: string;
    defaultValue: boolean | number;
    impactDescription: string;
  }[];
  codeSnippet?: {
    language: string;
    code: string;
    explanation: string;
  };
  telemetryStats: {
    frameBudgetMs: number;
    drawCalls: number;
    memoryFootprintMb: number;
  };
}

export interface DevLogBenchmark {
  metric: string;
  before: string;
  after: string;
  improvementPercent: number;
}

export interface DevLogEntry {
  id: string;
  slug: string;
  projectId: string;
  versionTag: string; // e.g., "v0.4.2 - Combat Overhaul"
  title: string;
  publishedAt: string; // ISO 8601
  readingTimeMinutes: number;
  tags: DisciplineTag[];
  summary: string;
  contentMarkdown: string;
  benchmarks?: DevLogBenchmark[];
  interactiveWidgetType?: string;
}

export interface PressKitAsset {
  label: string;
  category: 'Key Art' | 'Logos' | 'Screenshots' | 'Trailers';
  url: string;
  resolution: string;
  fileSize: string;
}

export interface PressKitData {
  developerBio: string;
  factSheet: {
    releaseDate: string;
    platforms: string[];
    regularPrice: string;
    website: string;
  };
  awardsAndHonors: string[];
  selectedArticles: { quote: string; publication: string }[];
  assets: PressKitAsset[];
}

export interface GameProject {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  releaseStatus: 'Shipped' | 'In Development' | 'Vertical Slice' | 'Game Jam Winner';
  engine: EngineType;
  role: string;
  teamSize: number;
  developmentDuration: string;
  heroTrailerUrl: string;
  playableDemoUrl?: string;
  externalLinks: {
    steam?: string;
    itch?: string;
    github?: string;
    pressKit?: string;
  };
  chapters: TrailerChapter[];
  mechanics: MechanicBreakdown[];
  devLogs: DevLogEntry[];
  pressKit?: PressKitData;
  telemetryStats?: {
    totalPlaytestSessions: number;
    medianPlayDurationSec: number;
    avgFps: number;
  };
}

export interface SessionTelemetryPayload {
  projectId: string;
  durationSeconds: number;
  averageFps: number;
  hardwareRenderer?: string;
}

export interface FeedbackPayload {
  projectId: string;
  targetType: 'trailer' | 'devlog';
  timestampSec?: number;
  devlogSectionId?: string;
  authorName?: string;
  feedbackText: string;
  rating?: number;
}
