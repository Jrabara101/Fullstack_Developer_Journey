import { create } from 'zustand';
import { ProductItem, FilterQueryState } from '../types';

interface PresetItem {
  id: string;
  name: string;
  filterState: FilterQueryState;
}

interface DiscoveryState {
  // Comparison Tray
  comparisonItems: ProductItem[];
  addComparisonItem: (item: ProductItem) => void;
  removeComparisonItem: (itemId: string) => void;
  clearComparison: () => void;
  isComparisonModalOpen: boolean;
  setComparisonModalOpen: (open: boolean) => void;

  // QuickLook Drawer
  quickLookProductId: string | null;
  setQuickLookProductId: (id: string | null) => void;

  // View Mode
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;

  // Priority Alchemist Ribbon toggle
  isAlchemistOpen: boolean;
  toggleAlchemist: () => void;
  setAlchemistOpen: (open: boolean) => void;

  // Saved Filter Presets
  savedPresets: PresetItem[];
  savePreset: (name: string, state: FilterQueryState) => void;
  deletePreset: (id: string) => void;

  // Shortlist Modal
  isShortlistModalOpen: boolean;
  setShortlistModalOpen: (open: boolean) => void;
  currentShortlistCode: string | null;
  setCurrentShortlistCode: (code: string | null) => void;
}

const DEFAULT_PRESETS: PresetItem[] = [
  {
    id: 'preset-ultralight-thru',
    name: 'Ultralight Thru-Hike Kit (Sub-500g)',
    filterState: {
      q: 'ultralight',
      categories: ['Ultralight & Alpine Tech'],
      brands: [],
      priceRangeCents: [5000, 45000],
      minRating: 4.8,
      inStockOnly: true,
      historicalLowOnly: false,
      specFilters: {},
      priorityWeights: { performance: 85, portability: 100, durability: 80, value: 75 },
      sortBy: 'FIT_SCORE'
    }
  },
  {
    id: 'preset-esports-hall-effect',
    name: 'Esports Magnetic Rapid-Trigger Deck',
    filterState: {
      q: 'hall effect magnetic',
      categories: ['Custom Mechanical Keyboards & Peripherals'],
      brands: [],
      priceRangeCents: [10000, 30000],
      minRating: 4.7,
      inStockOnly: true,
      historicalLowOnly: false,
      specFilters: {},
      priorityWeights: { performance: 100, portability: 80, durability: 95, value: 90 },
      sortBy: 'FIT_SCORE'
    }
  },
  {
    id: 'preset-audiophile-mastering',
    name: 'Studio Reference & Open-Back Monitoring',
    filterState: {
      q: 'reference studio',
      categories: ['Audiophile Studio & Acoustics'],
      brands: [],
      priceRangeCents: [40000, 200000],
      minRating: 4.8,
      inStockOnly: false,
      historicalLowOnly: false,
      specFilters: {},
      priorityWeights: { performance: 100, portability: 40, durability: 95, value: 80 },
      sortBy: 'FIT_SCORE'
    }
  }
];

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  comparisonItems: [],
  addComparisonItem: (item) =>
    set((state) => {
      if (state.comparisonItems.some((i) => i.id === item.id)) {
        return state;
      }
      if (state.comparisonItems.length >= 4) {
        // Limit to 4 items, replace the oldest
        return { comparisonItems: [...state.comparisonItems.slice(1), item] };
      }
      return { comparisonItems: [...state.comparisonItems, item] };
    }),
  removeComparisonItem: (itemId) =>
    set((state) => ({
      comparisonItems: state.comparisonItems.filter((i) => i.id !== itemId),
    })),
  clearComparison: () => set({ comparisonItems: [] }),
  isComparisonModalOpen: false,
  setComparisonModalOpen: (open) => set({ isComparisonModalOpen: open }),

  quickLookProductId: null,
  setQuickLookProductId: (id) => set({ quickLookProductId: id }),

  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),

  isAlchemistOpen: true,
  toggleAlchemist: () => set((state) => ({ isAlchemistOpen: !state.isAlchemistOpen })),
  setAlchemistOpen: (open) => set({ isAlchemistOpen: open }),

  savedPresets: DEFAULT_PRESETS,
  savePreset: (name, state) =>
    set((s) => ({
      savedPresets: [
        ...s.savedPresets,
        { id: `preset-${Date.now()}`, name, filterState: state },
      ],
    })),
  deletePreset: (id) =>
    set((s) => ({
      savedPresets: s.savedPresets.filter((p) => p.id !== id),
    })),

  isShortlistModalOpen: false,
  setShortlistModalOpen: (open) => set({ isShortlistModalOpen: open }),
  currentShortlistCode: null,
  setCurrentShortlistCode: (code) => set({ currentShortlistCode: code }),
}));
