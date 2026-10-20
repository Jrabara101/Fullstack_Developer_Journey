// ----------------------------------------------------
// Alchemical Crucible: Core Type Definitions
// ----------------------------------------------------

export type Coordinate = {
  x: number;
  y: number;
};

export type ItemCategory = 
  | 'earth'      // Tiers 1-3 (Foundational objects / Wood / Amber)
  | 'alloy'      // Tiers 4-6 (Refined tools / Steel / Quicksilver)
  | 'crystal'    // Tiers 7-9 (Energized relics / Cyan aether)
  | 'arcana'     // Tiers 10-11 (Mythic artifacts / Violet)
  | 'solar'      // Tier 12 (Apex Masterworks / Radiant Gold)
  | 'catalyst'   // Special transmutation catalyst / essence
  | 'branch_sun' // Divergent: Sunbloom Treant / Solar Branch
  | 'branch_void'; // Divergent: Abyssal Willow / Void Branch

export interface BoardItem {
  id: string;
  x: number;
  y: number;
  tier: number; // 1 to 12
  category: ItemCategory;
  isLocked: boolean;
  modifier?: 'catalyst_sun' | 'catalyst_void' | 'overcharged' | 'frozen';
  createdAt: number;
}

export type AnomalyType = 'rift' | 'geode' | 'corruption';

export interface BoardAnomaly {
  id: string;
  x: number;
  y: number;
  type: AnomalyType;
  turnsLeft: number;
  maxTurns: number;
  hitsRequired: number; // merges adjacent to this anomaly needed
  hitsTaken: number;
  rewardTier: number; // reward wildcard or catalyst when solved
}

export interface CellPosition {
  x: number;
  y: number;
}

export type ActionType = 'MERGE' | 'SPAWN' | 'SORT' | 'USE_POCKET' | 'TRASH';

export interface UserActionLog {
  action: ActionType;
  from?: [number, number];
  to?: [number, number];
  targetItemId?: string;
  sourceItemId?: string;
  timestamp: number;
  resultingTier?: number;
}

export interface MergeResult {
  success: boolean;
  type: '2_MERGE' | '3_MERGE' | '5_OVERMERGE' | 'BRANCH_EVOLUTION' | 'INVALID';
  targetCell: CellPosition;
  createdItems: BoardItem[];
  removedItemIds: string[];
  catalystSpawned?: BoardItem;
  scoreGained: number;
  comboCount: number;
  shockwaveCenter?: CellPosition;
  anomalyImpacted?: {
    id: string;
    cleared: boolean;
    rewardItem?: BoardItem;
  };
  cascadeTriggered?: boolean;
}

export interface BoardSnapshot {
  grid: (BoardItem | null)[][]; // 7x7 matrix
  items: BoardItem[];
  anomalies: BoardAnomaly[];
  pocketItem: BoardItem | null;
  score: number;
  movesRemaining: number;
  totalMerges: number;
  maxTierAchieved: number;
  spawnerCharges: number;
}

export interface CodexEntry {
  tier: number;
  id: string;
  name: string;
  title: string;
  category: ItemCategory;
  lore: string;
  recipeDesc: string;
  unlocked: boolean;
  element: 'earth' | 'steel' | 'crystal' | 'arcana' | 'solar';
  stats: {
    basePoints: number;
    catalystYield: string;
  };
}

export interface DailySeedData {
  seed: string;
  dateKey: string; // YYYY-MM-DD
  boardSize: number; // 7
  moveBudget: number; // e.g. 50
  initialItems: BoardItem[];
  initialAnomaly: BoardAnomaly;
  targetGoalTier: number; // e.g. 10 or 12
}

export interface VerificationResult {
  valid: boolean;
  score: number;
  highestTier: number;
  totalMerges: number;
  movesUsed: number;
  boardOverflows: number;
  badgeEmoji: string;
  badgeText: string;
  errorReason?: string;
}
