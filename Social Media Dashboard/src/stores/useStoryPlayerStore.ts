import { create } from 'zustand';
import type { StoryAuthorGroup, StorySlide } from '../types/social';

function preloadMedia(slide?: StorySlide) {
  if (!slide || typeof window === 'undefined') return;
  if (slide.media_type === 'image') {
    const img = new Image();
    img.src = slide.media_url;
  }
}

interface StoryPlayerState {
  isOpen: boolean;
  isHighlightMode: boolean;
  highlightTitle: string | null;
  authorQueue: StoryAuthorGroup[];
  activeAuthorIndex: number;
  activeSlideIndex: number;
  progress: number;
  isPaused: boolean;
  isMuted: boolean;
  isHudHidden: boolean;

  openStoryQueue: (groups: StoryAuthorGroup[], startAuthorId: string, startSlideIndex?: number) => void;
  openHighlightSlides: (author: StoryAuthorGroup['author'], title: string, slides: StorySlide[]) => void;
  close: () => void;
  nextSlide: () => boolean;
  prevSlide: () => void;
  jumpToAuthor: (authorIndex: number) => void;
  setProgress: (progress: number) => void;
  setPaused: (paused: boolean) => void;
  togglePaused: () => void;
  toggleMuted: () => void;
  setHudHidden: (hidden: boolean) => void;
  updateSlideWidgetInQueue: (updatedSlide: StorySlide) => void;
}

export const useStoryPlayerStore = create<StoryPlayerState>((set, get) => ({
  isOpen: false,
  isHighlightMode: false,
  highlightTitle: null,
  authorQueue: [],
  activeAuthorIndex: 0,
  activeSlideIndex: 0,
  progress: 0,
  isPaused: false,
  isMuted: false,
  isHudHidden: false,

  openStoryQueue: (groups, startAuthorId, startSlideIndex) => {
    const authorIdx = Math.max(
      0,
      groups.findIndex((g) => g.author.id === startAuthorId)
    );
    const group = groups[authorIdx];
    const firstUnseen =
      startSlideIndex ??
      Math.max(
        0,
        group?.slides.findIndex((s) => !s.is_viewed) ?? 0
      );

    preloadMedia(group?.slides[firstUnseen + 1]);
    preloadMedia(groups[authorIdx + 1]?.slides[0]);

    set({
      isOpen: true,
      isHighlightMode: false,
      highlightTitle: null,
      authorQueue: groups,
      activeAuthorIndex: authorIdx,
      activeSlideIndex: firstUnseen === -1 ? 0 : firstUnseen,
      progress: 0,
      isPaused: false,
      isHudHidden: false,
    });
  },

  openHighlightSlides: (author, title, slides) => {
    if (slides.length === 0) return;
    preloadMedia(slides[1]);
    set({
      isOpen: true,
      isHighlightMode: true,
      highlightTitle: title,
      authorQueue: [
        {
          author,
          slides,
          has_unseen: false,
          has_close_friends: slides.some((s) => s.audience === 'close_friends'),
        },
      ],
      activeAuthorIndex: 0,
      activeSlideIndex: 0,
      progress: 0,
      isPaused: false,
      isHudHidden: false,
    });
  },

  close: () =>
    set({
      isOpen: false,
      progress: 0,
      isPaused: false,
      isHudHidden: false,
    }),

  nextSlide: () => {
    const { authorQueue, activeAuthorIndex, activeSlideIndex } = get();
    const currentAuthor = authorQueue[activeAuthorIndex];
    if (!currentAuthor) {
      get().close();
      return false;
    }

    if (activeSlideIndex + 1 < currentAuthor.slides.length) {
      const nextIdx = activeSlideIndex + 1;
      preloadMedia(currentAuthor.slides[nextIdx + 1]);
      set({ activeSlideIndex: nextIdx, progress: 0 });
      return true;
    }

    if (activeAuthorIndex + 1 < authorQueue.length) {
      const nextAuthorIdx = activeAuthorIndex + 1;
      const nextGroup = authorQueue[nextAuthorIdx];
      preloadMedia(nextGroup?.slides[1]);
      preloadMedia(authorQueue[nextAuthorIdx + 1]?.slides[0]);
      set({
        activeAuthorIndex: nextAuthorIdx,
        activeSlideIndex: 0,
        progress: 0,
      });
      return true;
    }

    get().close();
    return false;
  },

  prevSlide: () => {
    const { authorQueue, activeAuthorIndex, activeSlideIndex, progress } = get();
    if (progress > 0.25 && activeSlideIndex >= 0) {
      set({ progress: 0 });
      return;
    }
    if (activeSlideIndex > 0) {
      set({ activeSlideIndex: activeSlideIndex - 1, progress: 0 });
      return;
    }
    if (activeAuthorIndex > 0) {
      const prevAuthorIdx = activeAuthorIndex - 1;
      const prevGroup = authorQueue[prevAuthorIdx];
      set({
        activeAuthorIndex: prevAuthorIdx,
        activeSlideIndex: Math.max(0, (prevGroup?.slides.length ?? 1) - 1),
        progress: 0,
      });
    } else {
      set({ progress: 0 });
    }
  },

  jumpToAuthor: (authorIndex) => {
    const { authorQueue } = get();
    if (authorIndex < 0 || authorIndex >= authorQueue.length) return;
    preloadMedia(authorQueue[authorIndex + 1]?.slides[0]);
    set({ activeAuthorIndex: authorIndex, activeSlideIndex: 0, progress: 0 });
  },

  setProgress: (progress) => set({ progress }),
  setPaused: (isPaused) => set({ isPaused }),
  togglePaused: () => set((s) => ({ isPaused: !s.isPaused })),
  toggleMuted: () => set((s) => ({ isMuted: !s.isMuted })),
  setHudHidden: (isHudHidden) => set({ isHudHidden }),

  updateSlideWidgetInQueue: (updatedSlide) =>
    set((s) => ({
      authorQueue: s.authorQueue.map((group) => ({
        ...group,
        slides: group.slides.map((sl) => (sl.id === updatedSlide.id ? updatedSlide : sl)),
      })),
    })),
}));

