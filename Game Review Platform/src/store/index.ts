import { create } from 'zustand';
import { ShelfStatus, PillarBreakdown, CriticProfile, GameCatalogItem } from '../types';

export type ActiveView = 'catalog' | 'game-detail' | 'profile' | 'lists' | 'taste-discover';

interface ReviewDraft {
  gameId: string;
  starRating: number;
  isMasterpiece: boolean;
  pillars: PillarBreakdown;
  completionStatus: ShelfStatus;
  playtimeHours: number;
  platformPlayed: string;
  patchVersion: string;
  bodyMarkdown: string;
}

interface AppState {
  // Navigation & Routing
  currentView: ActiveView;
  selectedGameId: string;
  selectedProfileId: string;
  setCurrentView: (view: ActiveView) => void;
  navigateToGame: (gameId: string) => void;
  navigateToProfile: (profileId: string) => void;

  // Active User Persona (Allows pair-testing taste matching and shelves)
  activeUserId: string;
  setActiveUserId: (id: string) => void;

  // Comparison Profile (for overlaying radar and taste sync)
  comparisonProfileId: string | null;
  setComparisonProfileId: (id: string | null) => void;

  // Modals
  isComposerOpen: boolean;
  setComposerOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isPassportOpen: boolean;
  setPassportOpen: (open: boolean) => void;
  isAntiBrigadeOpen: boolean;
  setAntiBrigadeOpen: (open: boolean) => void;

  // Review Draft State
  reviewDraft: ReviewDraft;
  updateReviewDraft: (patch: Partial<ReviewDraft>) => void;
  resetReviewDraft: (gameId?: string) => void;

  // User Preferences
  autoRevealSpoilersForCompleted: boolean;
  setAutoRevealSpoilersForCompleted: (val: boolean) => void;

  // Interactive Radar Weights & Comparison
  radarDisplayMode: 'community' | 'comparison' | 'user';
  setRadarDisplayMode: (mode: 'community' | 'comparison' | 'user') => void;
}

const DEFAULT_DRAFT: ReviewDraft = {
  gameId: 'elden-ring',
  starRating: 4.5,
  isMasterpiece: false,
  pillars: {
    gameplay: 4.5,
    narrative: 4.5,
    visuals: 4.5,
    audio: 4.5,
    polish: 4.5,
  },
  completionStatus: 'BEATEN',
  playtimeHours: 25,
  platformPlayed: 'PC',
  patchVersion: 'v1.08',
  bodyMarkdown: '',
};

export const useAppStore = create<AppState>((set) => ({
  currentView: 'catalog',
  selectedGameId: 'elden-ring',
  selectedProfileId: 'user-valkyrie',

  setCurrentView: (view) => set({ currentView: view }),
  navigateToGame: (gameId) => set({ selectedGameId: gameId, currentView: 'game-detail' }),
  navigateToProfile: (profileId) => set({ selectedProfileId: profileId, currentView: 'profile' }),

  activeUserId: 'user-valkyrie',
  setActiveUserId: (id) => set({ activeUserId: id }),

  comparisonProfileId: 'user-frameperfect',
  setComparisonProfileId: (id) => set({ comparisonProfileId: id }),

  isComposerOpen: false,
  setComposerOpen: (open) => set({ isComposerOpen: open }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  isPassportOpen: false,
  setPassportOpen: (open) => set({ isPassportOpen: open }),

  isAntiBrigadeOpen: false,
  setAntiBrigadeOpen: (open) => set({ isAntiBrigadeOpen: open }),

  reviewDraft: DEFAULT_DRAFT,
  updateReviewDraft: (patch) =>
    set((state) => ({ reviewDraft: { ...state.reviewDraft, ...patch } })),
  resetReviewDraft: (gameId = 'elden-ring') =>
    set({ reviewDraft: { ...DEFAULT_DRAFT, gameId } }),

  autoRevealSpoilersForCompleted: true,
  setAutoRevealSpoilersForCompleted: (val) =>
    set({ autoRevealSpoilersForCompleted: val }),

  radarDisplayMode: 'comparison',
  setRadarDisplayMode: (mode) => set({ radarDisplayMode: mode }),
}));
