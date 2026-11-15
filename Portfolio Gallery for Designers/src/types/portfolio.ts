export type StudioLightingMode = 'cotton' | 'white' | 'darkroom';

export type ViewPostureMode = 'exhibition' | 'index' | 'reel';

export type Discipline =
  | 'Brand & Typography'
  | 'Digital Product / UI'
  | 'Editorial Photography'
  | 'Motion & 3D';

export type ColorHarmonyId =
  | 'terracotta'
  | 'cobalt'
  | 'monochrome'
  | 'sage'
  | 'obsidian-amber';

export type VisualMood =
  | 'Minimal & Architectural'
  | 'Golden Hour & Analog'
  | 'High-Contrast Nocturne'
  | 'Playful & Kinetic';

export type ArtifactKind = 'photography' | 'design';

export type VisualComplexity = 'minimal' | 'moderate' | 'intricate';

export interface ColorHarmonySwatch {
  id: ColorHarmonyId;
  label: string;
  hex: string;
  description: string;
}

export interface GridAnnotation {
  xPct: number;
  yPct: number;
  label: string;
  detail?: string;
}

export interface GridOverlaySpec {
  gridColumns: number;
  baselinePx: number;
  focalPointXY: [number, number]; // percentages 0..100
  ruleOfThirds: boolean;
  swissMarginsPct: number;
  xrayMode: 'swiss-wireframe' | 'raw-lighting-diagram';
  lightingNodes?: {
    xPct: number;
    yPct: number;
    kind: 'key-light' | 'fill-bounce' | 'camera' | 'meter';
    label: string;
  }[];
  wireframeBlocks?: {
    xPct: number;
    yPct: number;
    wPct: number;
    hPct: number;
    tag: string;
  }[];
  annotations: GridAnnotation[];
}

export interface ColorTokenSpec {
  name: string;
  hex: string;
  oklch: string;
  role: string;
}

export interface DesignSystemManifest {
  fontFamilies: {
    name: string;
    role: string;
    cssFamily: string;
    sampleHeadline: string;
    weights: string;
  }[];
  colorTokens: ColorTokenSpec[];
  spacingScale: string;
  interactivePrototypeType?: 'audio-os' | 'issue-engine' | 'field-recorder' | 'watch-dial';
}

export interface PhotoPerspectiveSpec {
  humanizedNote: string;
  lightingSummary: string;
  lensCharacter: string;
  sourceResolutionPx: {
    width: number;
    height: number;
  };
  archivePaper: string;
}

export interface CaseStoryData {
  snapshot: {
    brief: string;
    friction: string;
    outcome: string;
  };
  impactMetrics: {
    label: string;
    value: string;
  }[];
  keyFrames: string[];
  fullEssayParagraphs: string[];
  voiceNote: {
    durationSec: number;
    title: string;
    transcript: string;
    ambientProfile:
      | 'studio-tape'
      | 'kyoto-courtyard'
      | 'berlin-rain'
      | 'nordic-glasshouse'
      | 'desert-wind';
  };
}

export interface PortfolioArtifact {
  id: string;
  catalogNumber: string; // e.g., "01"
  contactFrameCode: string; // e.g., "01A"
  title: string;
  subtitle: string;
  client: string;
  location: string;
  year: number;
  kind: ArtifactKind;
  primaryDiscipline: Discipline;
  disciplines: Discipline[];
  deliverables: string[];
  mood: VisualMood;
  colorHarmony: ColorHarmonyId;
  dominantHexes: [string, string, string];
  aspectRatioLabel: string; // e.g., "16:9", "4:5", "3:2", "1:1", "9:16"
  nativeWidth: number;
  nativeHeight: number;
  complexity: VisualComplexity;
  isTopTenHighlight: boolean;
  highlightRank?: number;
  personaTags: string[];
  imageUrl: string;
  gridSpec: GridOverlaySpec;
  designManifest?: DesignSystemManifest;
  photoSpec?: PhotoPerspectiveSpec;
  story: CaseStoryData;
}

export interface ComputedArtifactMeta {
  artifact: PortfolioArtifact;
  computedAspectRatio: number;
  luminance: number;
  isHighKey: boolean;
  contrastWithDarkroom: number;
  contrastWithCotton: number;
  ambientMattingHex: string;
  ambientMattingBorder: string;
  maxPrint300Dpi?: {
    widthIn: number;
    heightIn: number;
    widthCm: number;
    heightCm: number;
    formattedIn: string;
    formattedCm: string;
  };
}

export type RhythmRowPattern = 'full-stage' | 'asymmetric-pair' | 'cross-medium-diptych';

export interface ExhibitionRow {
  id: string;
  pattern: RhythmRowPattern;
  items: ComputedArtifactMeta[];
  caption?: string;
}

export interface PersonaContext {
  active: boolean;
  tokenKey: string;
  tokenValue: string;
  greetingTitle: string;
  greetingSubtitle: string;
  priorityDisciplines: Discipline[];
  priorityTags: string[];
}

export interface BriefcaseItemState {
  id: string;
  note: string;
}

export interface ViewingRoomData {
  token: string;
  title: string;
  items: BriefcaseItemState[];
  createdAt: string;
}

