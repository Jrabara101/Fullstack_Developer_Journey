import { create } from 'zustand';
import type { AppView, FeedLens } from '../types/social';

export interface ToastItem {
  id: string;
  message: string;
  tone?: 'emerald' | 'cobalt' | 'rose';
}

interface CreateModalState {
  isOpen: boolean;
  tab: 'post' | 'story';
  addYoursPrompt: { prompt: string; chain_id: string } | null;
}

interface AppState {
  theme: 'light' | 'dark';
  activeView: AppView;
  activeLens: FeedLens;
  lensScrollMemory: Record<FeedLens, number>;
  profileUsername: string;
  exploreTag: string;
  isCommandPaletteOpen: boolean;
  createModal: CreateModalState;
  toasts: ToastItem[];

  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setActiveView: (view: AppView) => void;
  setActiveLens: (lens: FeedLens) => void;
  saveLensScroll: (lens: FeedLens, scrollY: number) => void;
  navigateToProfile: (username: string) => void;
  navigateToExploreTag: (tag: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openCreateModal: (
    tab?: 'post' | 'story',
    addYoursPrompt?: { prompt: string; chain_id: string } | null
  ) => void;
  closeCreateModal: () => void;
  pushToast: (message: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
}

const initialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('lumen_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
};

export const useAppStore = create<AppState>((set, get) => ({
  theme: initialTheme(),
  activeView: 'feed',
  activeLens: 'for_you',
  lensScrollMemory: {
    for_you: 0,
    following: 0,
    close_friends: 0,
    media: 0,
  },
  profileUsername: 'alex_chen',
  exploreTag: '',
  isCommandPaletteOpen: false,
  createModal: {
    isOpen: false,
    tab: 'post',
    addYoursPrompt: null,
  },
  toasts: [],

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumen_theme', next);
    }
    set({ theme: next });
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumen_theme', theme);
    }
    set({ theme });
  },

  setActiveView: (activeView) => set({ activeView }),

  setActiveLens: (activeLens) => set({ activeLens }),

  saveLensScroll: (lens, scrollY) =>
    set((s) => ({
      lensScrollMemory: { ...s.lensScrollMemory, [lens]: scrollY },
    })),

  navigateToProfile: (username) =>
    set({
      profileUsername: username,
      activeView: 'profile',
    }),

  navigateToExploreTag: (tag) =>
    set({
      exploreTag: tag,
      activeView: 'explore',
    }),

  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

  openCreateModal: (tab = 'post', addYoursPrompt = null) =>
    set({
      createModal: { isOpen: true, tab, addYoursPrompt },
    }),

  closeCreateModal: () =>
    set((s) => ({
      createModal: { ...s.createModal, isOpen: false, addYoursPrompt: null },
    })),

  pushToast: (message, tone = 'emerald') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, tone }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 3200);
  },

  dismissToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
}));

