// ----------------------------------------------------
// Zustand Game Store: Reactive State & Engine Bridge
// ----------------------------------------------------

import { create } from 'zustand';
import { MergeEngine } from '../engine/mergeEngine';
import type {
  BoardItem,
  BoardAnomaly,
  Coordinate,
  DailySeedData,
  VerificationResult,
  MergeResult,
} from '../engine/types';
import { soundEngine } from '../engine/soundEngine';

interface GameState {
  engine: MergeEngine;
  grid: (BoardItem | null)[][];
  items: BoardItem[];
  anomalies: BoardAnomaly[];
  pocketItem: BoardItem | null;
  score: number;
  movesRemaining: number;
  totalMerges: number;
  maxTierAchieved: number;
  spawnerCharges: number;
  canUndo: boolean;
  canRedo: boolean;
  boardOverflows: number;

  // Game Mode & Seeds
  gameMode: 'daily' | 'sandbox';
  dailySeed: string;
  dailyChallengeData: DailySeedData | null;
  isLoadingChallenge: boolean;

  // Unlocked Codex entries
  unlockedTiers: Set<number>;
  unlockedCategories: Set<string>;

  // Interactive Drag & Visual Feedback
  draggedItem: BoardItem | null;
  hoveredCell: Coordinate | null;
  activeShockwave: { x: number; y: number; tier: number } | null;
  lastMergeCombo: { count: number; points: number; label: string } | null;
  isCodexOpen: boolean;
  isVerificationModalOpen: boolean;
  isVerifying: boolean;
  verificationResult: VerificationResult | null;
  soundMuted: boolean;

  // Actions
  initSandbox: () => void;
  initDailyChallenge: (data?: DailySeedData) => Promise<void>;
  spawnItem: () => BoardItem | null;
  moveOrMerge: (from: Coordinate, to: Coordinate) => MergeResult;
  storeInPocket: (item: BoardItem) => boolean;
  retrievePocket: (to: Coordinate) => BoardItem | null;
  trashItem: (itemId: string) => boolean;
  autoSort: () => void;
  undo: () => void;
  redo: () => void;
  setDraggedItem: (item: BoardItem | null) => void;
  setHoveredCell: (cell: Coordinate | null) => void;
  triggerShockwave: (x: number, y: number, tier: number) => void;
  clearShockwave: () => void;
  setIsCodexOpen: (open: boolean) => void;
  setIsVerificationModalOpen: (open: boolean) => void;
  toggleSound: () => void;
  verifyRun: () => Promise<void>;
}

// LocalStorage helpers for persistent codex discovery
const CODEX_STORAGE_KEY = 'alchemical_codex_unlocked';
const CATEGORY_STORAGE_KEY = 'alchemical_categories_unlocked';

function loadPersistedUnlocks(): { tiers: Set<number>; categories: Set<string> } {
  try {
    const savedTiers = localStorage.getItem(CODEX_STORAGE_KEY);
    const savedCats = localStorage.getItem(CATEGORY_STORAGE_KEY);
    const tiers = savedTiers ? new Set<number>(JSON.parse(savedTiers)) : new Set<number>([1]);
    const categories = savedCats ? new Set<string>(JSON.parse(savedCats)) : new Set<string>(['earth']);
    return { tiers, categories };
  } catch {
    return { tiers: new Set([1]), categories: new Set(['earth']) };
  }
}

function persistUnlocks(tiers: Set<number>, categories: Set<string>): void {
  try {
    localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(Array.from(tiers)));
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(Array.from(categories)));
  } catch {
    // Ignore storage errors
  }
}

const initialUnlocks = loadPersistedUnlocks();
const defaultEngine = new MergeEngine({ boardSize: 7, seed: 'ALCH-INITIAL', moveBudget: 50 });

export const useGameStore = create<GameState>((set, get) => ({
  engine: defaultEngine,
  grid: defaultEngine.getGrid(),
  items: defaultEngine.getItems(),
  anomalies: defaultEngine.getAnomalies(),
  pocketItem: null,
  score: 0,
  movesRemaining: 50,
  totalMerges: 0,
  maxTierAchieved: 1,
  spawnerCharges: 15,
  canUndo: false,
  canRedo: false,
  boardOverflows: 0,

  gameMode: 'daily',
  dailySeed: '',
  dailyChallengeData: null,
  isLoadingChallenge: false,

  unlockedTiers: initialUnlocks.tiers,
  unlockedCategories: initialUnlocks.categories,

  draggedItem: null,
  hoveredCell: null,
  activeShockwave: null,
  lastMergeCombo: null,
  isCodexOpen: false,
  isVerificationModalOpen: false,
  isVerifying: false,
  verificationResult: null,
  soundMuted: false,

  initSandbox: () => {
    const engine = new MergeEngine({
      boardSize: 7,
      seed: 'ALCH-SANDBOX-' + Date.now(),
      moveBudget: 999,
    });
    // Spawn a few starter items
    engine.spawnItem({ x: 3, y: 3 });
    engine.spawnItem({ x: 2, y: 3 });
    engine.spawnItem({ x: 4, y: 3 });
    engine.spawnItem({ x: 3, y: 2 });

    set({
      engine,
      grid: engine.getGrid(),
      items: engine.getItems(),
      anomalies: engine.getAnomalies(),
      pocketItem: null,
      score: 0,
      movesRemaining: 999,
      totalMerges: 0,
      maxTierAchieved: 1,
      spawnerCharges: 25,
      canUndo: false,
      canRedo: false,
      gameMode: 'sandbox',
      dailySeed: 'SANDBOX-FREE-PLAY',
      verificationResult: null,
    });
  },

  initDailyChallenge: async (providedData?: DailySeedData) => {
    let data = providedData;
    if (!data) {
      set({ isLoadingChallenge: true });
      try {
        const res = await fetch('/api/daily-seed');
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.warn('Falling back to local daily seed generation', err);
      }
    }

    // Fallback if network failed or server offline
    if (!data) {
      const { generateDailyChallenge } = await import('../server/validator');
      data = generateDailyChallenge();
    }

    const engine = new MergeEngine({
      boardSize: data.boardSize,
      seed: data.seed,
      moveBudget: data.moveBudget,
    });

    for (const it of data.initialItems) {
      engine.addItemDirectly(it);
    }
    engine.addAnomaly(data.initialAnomaly);

    const updatedTiers = new Set(get().unlockedTiers);
    for (const it of data.initialItems) {
      updatedTiers.add(it.tier);
    }
    persistUnlocks(updatedTiers, get().unlockedCategories);

    set({
      engine,
      grid: engine.getGrid(),
      items: engine.getItems(),
      anomalies: engine.getAnomalies(),
      pocketItem: null,
      score: 0,
      movesRemaining: data.moveBudget,
      totalMerges: 0,
      maxTierAchieved: engine.maxTierAchieved,
      spawnerCharges: 15,
      canUndo: false,
      canRedo: false,
      boardOverflows: 0,
      gameMode: 'daily',
      dailySeed: data.seed,
      dailyChallengeData: data,
      isLoadingChallenge: false,
      verificationResult: null,
      unlockedTiers: updatedTiers,
    });
  },

  spawnItem: () => {
    const { engine } = get();
    const item = engine.spawnItem();
    if (item) {
      soundEngine.playSpawnPop();
      const updatedTiers = new Set(get().unlockedTiers);
      const updatedCats = new Set(get().unlockedCategories);
      updatedTiers.add(item.tier);
      updatedCats.add(item.category);
      persistUnlocks(updatedTiers, updatedCats);

      set({
        grid: engine.getGrid(),
        items: engine.getItems(),
        anomalies: engine.getAnomalies(),
        spawnerCharges: engine.spawnerCharges,
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
        unlockedTiers: updatedTiers,
        unlockedCategories: updatedCats,
      });
    } else {
      soundEngine.playInvalidDrop();
    }
    return item;
  },

  moveOrMerge: (from: Coordinate, to: Coordinate) => {
    const { engine } = get();
    const result = engine.moveOrMerge(from, to);

    if (result.success) {
      if (result.type === '5_OVERMERGE') {
        soundEngine.playOverMerge();
        get().triggerShockwave(to.x, to.y, result.createdItems[0]?.tier || 1);
        set({
          lastMergeCombo: {
            count: 5,
            points: result.scoreGained,
            label: '5-MERGE OVER-MERGE! +CATALYST',
          },
        });
      } else if (result.type === '3_MERGE') {
        soundEngine.playMergeChime(result.createdItems[0]?.tier || 1);
        get().triggerShockwave(to.x, to.y, result.createdItems[0]?.tier || 1);
        set({
          lastMergeCombo: {
            count: 3,
            points: result.scoreGained,
            label: '3-MERGE COMBO!',
          },
        });
      } else if (result.type === 'BRANCH_EVOLUTION') {
        soundEngine.playAnomalySolved();
        get().triggerShockwave(to.x, to.y, 6);
        set({
          lastMergeCombo: {
            count: 2,
            points: result.scoreGained,
            label: 'MYTHIC AWAKENING BRANCH!',
          },
        });
      } else if (result.type === '2_MERGE') {
        soundEngine.playMergeChime(result.createdItems[0]?.tier || 1);
        get().triggerShockwave(to.x, to.y, result.createdItems[0]?.tier || 1);
      }

      if (result.anomalyImpacted) {
        if (result.anomalyImpacted.cleared) {
          soundEngine.playAnomalySolved();
        } else {
          soundEngine.playAnomalyCrack();
        }
      }

      const updatedTiers = new Set(get().unlockedTiers);
      const updatedCats = new Set(get().unlockedCategories);
      for (const item of result.createdItems) {
        updatedTiers.add(item.tier);
        updatedCats.add(item.category);
      }
      persistUnlocks(updatedTiers, updatedCats);

      set({
        grid: engine.getGrid(),
        items: engine.getItems(),
        anomalies: engine.getAnomalies(),
        score: engine.score,
        movesRemaining: engine.movesRemaining,
        totalMerges: engine.totalMerges,
        maxTierAchieved: engine.maxTierAchieved,
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
        unlockedTiers: updatedTiers,
        unlockedCategories: updatedCats,
      });
    } else {
      soundEngine.playInvalidDrop();
    }

    return result;
  },

  storeInPocket: (item: BoardItem) => {
    const { engine } = get();
    const success = engine.storeInPocket(item);
    if (success) {
      soundEngine.playPickup();
      set({
        grid: engine.getGrid(),
        items: engine.getItems(),
        pocketItem: engine.getPocketItem(),
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      });
    } else {
      soundEngine.playInvalidDrop();
    }
    return success;
  },

  retrievePocket: (to: Coordinate) => {
    const { engine } = get();
    const item = engine.retrievePocket(to);
    if (item) {
      soundEngine.playPickup();
      set({
        grid: engine.getGrid(),
        items: engine.getItems(),
        pocketItem: engine.getPocketItem(),
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      });
    } else {
      soundEngine.playInvalidDrop();
    }
    return item;
  },

  trashItem: (itemId: string) => {
    const { engine } = get();
    const success = engine.trashItem(itemId);
    if (success) {
      soundEngine.playInvalidDrop();
      set({
        grid: engine.getGrid(),
        items: engine.getItems(),
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      });
    }
    return success;
  },

  autoSort: () => {
    const { engine } = get();
    engine.autoSort();
    soundEngine.playCascade(1);
    set({
      grid: engine.getGrid(),
      items: engine.getItems(),
      canUndo: engine.canUndo(),
      canRedo: engine.canRedo(),
    });
  },

  undo: () => {
    const { engine } = get();
    if (engine.undo()) {
      soundEngine.playHoverTarget();
      set({
        grid: engine.getGrid(),
        items: engine.getItems(),
        anomalies: engine.getAnomalies(),
        pocketItem: engine.getPocketItem(),
        score: engine.score,
        movesRemaining: engine.movesRemaining,
        totalMerges: engine.totalMerges,
        maxTierAchieved: engine.maxTierAchieved,
        spawnerCharges: engine.spawnerCharges,
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      });
    }
  },

  redo: () => {
    const { engine } = get();
    if (engine.redo()) {
      soundEngine.playHoverTarget();
      set({
        grid: engine.getGrid(),
        items: engine.getItems(),
        anomalies: engine.getAnomalies(),
        pocketItem: engine.getPocketItem(),
        score: engine.score,
        movesRemaining: engine.movesRemaining,
        totalMerges: engine.totalMerges,
        maxTierAchieved: engine.maxTierAchieved,
        spawnerCharges: engine.spawnerCharges,
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      });
    }
  },

  setDraggedItem: (item: BoardItem | null) => {
    if (item) soundEngine.playPickup();
    set({ draggedItem: item });
  },

  setHoveredCell: (cell: Coordinate | null) => {
    set({ hoveredCell: cell });
  },

  triggerShockwave: (x: number, y: number, tier: number) => {
    set({ activeShockwave: { x, y, tier } });
    setTimeout(() => {
      get().clearShockwave();
    }, 600);
  },

  clearShockwave: () => {
    set({ activeShockwave: null });
  },

  setIsCodexOpen: (open: boolean) => {
    set({ isCodexOpen: open });
  },

  setIsVerificationModalOpen: (open: boolean) => {
    set({ isVerificationModalOpen: open });
  },

  toggleSound: () => {
    const muted = !get().soundMuted;
    soundEngine.setMuted(muted);
    set({ soundMuted: muted });
  },

  verifyRun: async () => {
    const { engine, dailySeed, score, maxTierAchieved } = get();
    set({ isVerifying: true, isVerificationModalOpen: true });

    try {
      const actions = engine.getActionLog();
      const payload = {
        seed: dailySeed,
        actions,
        claimedScore: score,
        claimedTier: maxTierAchieved,
      };

      const res = await fetch('/api/verify-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result: VerificationResult = await res.json();
        set({ verificationResult: result, isVerifying: false });
        return;
      }
    } catch (err) {
      console.warn('Network verify failed, falling back to client-side verification engine', err);
    }

    // Client-side fallback validator
    const { verifyRunSimulation } = await import('../server/validator');
    const result = verifyRunSimulation({
      seed: dailySeed,
      actions: engine.getActionLog(),
      claimedScore: score,
      claimedTier: maxTierAchieved,
    });
    set({ verificationResult: result, isVerifying: false });
  },
}));
