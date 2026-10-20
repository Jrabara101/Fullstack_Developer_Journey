// ----------------------------------------------------
// Alchemical Crucible: Headless Deterministic Merge Engine
// ----------------------------------------------------

import { PRNG } from './prng';
import type {
  BoardItem,
  BoardAnomaly,
  BoardSnapshot,
  Coordinate,
  MergeResult,
  UserActionLog,
  ItemCategory,
} from './types';
import { CODEX_ENTRIES } from './codex';

export interface MergeEngineOptions {
  boardSize?: number;
  seed?: string | number;
  moveBudget?: number;
  maxUndoSteps?: number;
}

export class MergeEngine {
  public readonly boardSize: number;
  public prng: PRNG;
  public moveBudget: number;
  public movesRemaining: number;
  public score: number;
  public totalMerges: number;
  public maxTierAchieved: number;
  public spawnerCharges: number;
  public readonly maxSpawnerCharges: number = 20;
  public boardOverflows: number = 0;

  private items: Map<string, BoardItem> = new Map();
  private anomalies: Map<string, BoardAnomaly> = new Map();
  private pocketItem: BoardItem | null = null;
  private actionLog: UserActionLog[] = [];

  // Command History for rolling 20-step Undo/Redo
  private readonly maxUndoSteps: number;
  private undoStack: BoardSnapshot[] = [];
  private redoStack: BoardSnapshot[] = [];

  // Auto-increment id counter
  private itemCounter: number = 0;

  constructor(options: MergeEngineOptions = {}) {
    this.boardSize = options.boardSize ?? 7;
    const seed = options.seed ?? 'ALCH-FREE-SANDBOX';
    this.prng = new PRNG(seed);
    this.moveBudget = options.moveBudget ?? 50;
    this.movesRemaining = this.moveBudget;
    this.score = 0;
    this.totalMerges = 0;
    this.maxTierAchieved = 1;
    this.spawnerCharges = 15;
    this.maxUndoSteps = options.maxUndoSteps ?? 20;
  }

  // --------------------------------------------------
  // State Queries
  // --------------------------------------------------

  public getGrid(): (BoardItem | null)[][] {
    const grid: (BoardItem | null)[][] = Array.from({ length: this.boardSize }, () =>
      Array.from({ length: this.boardSize }, () => null)
    );
    for (const item of this.items.values()) {
      if (item.x >= 0 && item.x < this.boardSize && item.y >= 0 && item.y < this.boardSize) {
        grid[item.y][item.x] = item;
      }
    }
    return grid;
  }

  public getItems(): BoardItem[] {
    return Array.from(this.items.values());
  }

  public getItemAt(x: number, y: number): BoardItem | null {
    for (const item of this.items.values()) {
      if (item.x === x && item.y === y) return item;
    }
    return null;
  }

  public getAnomalies(): BoardAnomaly[] {
    return Array.from(this.anomalies.values());
  }

  public getAnomalyAt(x: number, y: number): BoardAnomaly | null {
    for (const a of this.anomalies.values()) {
      if (a.x === x && a.y === y) return a;
    }
    return null;
  }

  public getPocketItem(): BoardItem | null {
    return this.pocketItem;
  }

  public getActionLog(): UserActionLog[] {
    return [...this.actionLog];
  }

  public getEmptyCells(): Coordinate[] {
    const empty: Coordinate[] = [];
    const grid = this.getGrid();
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        if (!grid[y][x] && !this.getAnomalyAt(x, y)) {
          empty.push({ x, y });
        }
      }
    }
    return empty;
  }

  public isBoardFull(): boolean {
    return this.getEmptyCells().length === 0;
  }

  // --------------------------------------------------
  // Spawner & Drop Logic
  // --------------------------------------------------

  /**
   * Spawns a new item into an empty board cell
   */
  public spawnItem(preferredCell?: Coordinate): BoardItem | null {
    if (this.spawnerCharges <= 0) return null;

    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) {
      this.boardOverflows++;
      return null;
    }

    this.saveHistoryState();

    let target: Coordinate;
    if (preferredCell && !this.getItemAt(preferredCell.x, preferredCell.y) && !this.getAnomalyAt(preferredCell.x, preferredCell.y)) {
      target = preferredCell;
    } else {
      // Deterministically pick from available empty cells
      target = this.prng.choice(emptyCells);
    }

    // Determine tier via deterministic drop weights
    const roll = this.prng.next();
    let tier = 1;
    let category: ItemCategory = 'earth';

    if (roll < 0.65) {
      tier = 1; // Sprout of First Dawn (65%)
      category = 'earth';
    } else if (roll < 0.90) {
      tier = 2; // Amber Sapling (25%)
      category = 'earth';
    } else if (roll < 0.97) {
      tier = 3; // Verdant Hearthstone (7%)
      category = 'earth';
    } else {
      tier = 4; // Solar Shard Catalyst or Crucible Shard (3%)
      category = this.prng.next() < 0.5 ? 'catalyst' : 'alloy';
    }

    this.itemCounter++;
    const newItem: BoardItem = {
      id: `item_${this.itemCounter}_${Date.now()}`,
      x: target.x,
      y: target.y,
      tier,
      category,
      isLocked: false,
      createdAt: Date.now(),
    };

    this.items.set(newItem.id, newItem);
    this.spawnerCharges--;
    this.decrementAnomalies();

    this.actionLog.push({
      action: 'SPAWN',
      to: [target.x, target.y],
      targetItemId: newItem.id,
      timestamp: Date.now(),
      resultingTier: tier,
    });

    return newItem;
  }

  // --------------------------------------------------
  // Drag & Merge Mechanics
  // --------------------------------------------------

  /**
   * Handles moving or merging item from (fromX, fromY) to (toX, toY)
   */
  public moveOrMerge(from: Coordinate, to: Coordinate): MergeResult {
    const sourceItem = this.getItemAt(from.x, from.y);
    if (!sourceItem || sourceItem.isLocked) {
      return { success: false, type: 'INVALID', targetCell: to, createdItems: [], removedItemIds: [], scoreGained: 0, comboCount: 0 };
    }

    if (from.x === to.x && from.y === to.y) {
      return { success: false, type: 'INVALID', targetCell: to, createdItems: [], removedItemIds: [], scoreGained: 0, comboCount: 0 };
    }

    const targetAnomaly = this.getAnomalyAt(to.x, to.y);
    if (targetAnomaly) {
      // Cannot drop directly onto an anomaly obstacle
      return { success: false, type: 'INVALID', targetCell: to, createdItems: [], removedItemIds: [], scoreGained: 0, comboCount: 0 };
    }

    const targetItem = this.getItemAt(to.x, to.y);

    // Case 1: Empty slot -> Simple move
    if (!targetItem) {
      this.saveHistoryState();
      sourceItem.x = to.x;
      sourceItem.y = to.y;

      this.actionLog.push({
        action: 'MERGE',
        from: [from.x, from.y],
        to: [to.x, to.y],
        sourceItemId: sourceItem.id,
        timestamp: Date.now(),
      });

      return {
        success: true,
        type: 'INVALID', // Not a merge, just reposition
        targetCell: to,
        createdItems: [sourceItem],
        removedItemIds: [],
        scoreGained: 0,
        comboCount: 0,
      };
    }

    // Case 2: Branching Evolution via Catalyst
    if (
      (sourceItem.category === 'catalyst' && targetItem.category === 'earth') ||
      (targetItem.category === 'catalyst' && sourceItem.category === 'earth')
    ) {
      this.saveHistoryState();
      return this.executeBranchEvolution(sourceItem, targetItem, to);
    }

    // Case 3: Matching Tier Merge (2-merge, 3-merge, or 5-merge over-merge!)
    if (sourceItem.tier === targetItem.tier && !sourceItem.category.startsWith('branch_') && !targetItem.category.startsWith('branch_')) {
      this.saveHistoryState();
      return this.executeMergeCluster(sourceItem, targetItem, to);
    }

    // Case 4: Incompatible items -> Swap positions
    this.saveHistoryState();
    sourceItem.x = to.x;
    sourceItem.y = to.y;
    targetItem.x = from.x;
    targetItem.y = from.y;

    this.actionLog.push({
      action: 'MERGE',
      from: [from.x, from.y],
      to: [to.x, to.y],
      sourceItemId: sourceItem.id,
      targetItemId: targetItem.id,
      timestamp: Date.now(),
    });

    return {
      success: true,
      type: 'INVALID',
      targetCell: to,
      createdItems: [sourceItem, targetItem],
      removedItemIds: [],
      scoreGained: 0,
      comboCount: 0,
    };
  }

  /**
   * Executes a branch evolution (e.g. Flora + Catalyst -> Sunbloom Treant / Abyssal Willow)
   */
  private executeBranchEvolution(source: BoardItem, target: BoardItem, to: Coordinate): MergeResult {
    const isSunBranch = this.prng.next() < 0.6;
    const branchCategory: ItemCategory = isSunBranch ? 'branch_sun' : 'branch_void';
    const nextTier = 6; // Divergent Tier 6 Mythic

    this.items.delete(source.id);
    this.items.delete(target.id);

    this.itemCounter++;
    const evolvedItem: BoardItem = {
      id: `branch_${this.itemCounter}_${Date.now()}`,
      x: to.x,
      y: to.y,
      tier: nextTier,
      category: branchCategory,
      isLocked: false,
      createdAt: Date.now(),
    };
    this.items.set(evolvedItem.id, evolvedItem);

    const scoreGained = 5000;
    this.score += scoreGained;
    this.totalMerges++;
    this.movesRemaining = Math.max(0, this.movesRemaining - 1);
    this.decrementAnomalies();

    // Check adjacent anomalies
    const anomalyImpact = this.impactAdjacentAnomalies(to);

    this.actionLog.push({
      action: 'MERGE',
      from: [source.x, source.y],
      to: [to.x, to.y],
      sourceItemId: source.id,
      targetItemId: target.id,
      resultingTier: nextTier,
      timestamp: Date.now(),
    });

    return {
      success: true,
      type: 'BRANCH_EVOLUTION',
      targetCell: to,
      createdItems: [evolvedItem],
      removedItemIds: [source.id, target.id],
      scoreGained,
      comboCount: 1,
      shockwaveCenter: to,
      anomalyImpacted: anomalyImpact,
    };
  }

  /**
   * Evaluates cluster merges (Pair, 3-Merge, or 5-Merge Over-Merge) and triggers cascades
   */
  private executeMergeCluster(source: BoardItem, target: BoardItem, to: Coordinate): MergeResult {
    const baseTier = target.tier;
    const nextTier = Math.min(12, baseTier + 1);
    if (nextTier > this.maxTierAchieved) {
      this.maxTierAchieved = nextTier;
    }

    // Scan for adjacent identical items around target (multi-merge evaluation)
    const cluster = this.findMatchingCluster(to, baseTier, [source.id, target.id]);
    const allCandidates = [source, target, ...cluster];
    const mergeCount = allCandidates.length;

    const removedIds: string[] = [];
    const createdItems: BoardItem[] = [];
    let catalystItem: BoardItem | undefined;
    let scoreGained = 0;
    let mergeType: MergeResult['type'] = '2_MERGE';

    if (mergeCount >= 5) {
      // --- 5-MERGE OVER-MERGE ---
      // Consumes 5 items, yields TWO upgraded units + 1 Solar Shard Catalyst!
      mergeType = '5_OVERMERGE';
      const itemsToConsume = allCandidates.slice(0, 5);
      for (const item of itemsToConsume) {
        this.items.delete(item.id);
        removedIds.push(item.id);
      }

      // Unit 1 at target cell
      this.itemCounter++;
      const unit1: BoardItem = {
        id: `merged_${this.itemCounter}_${Date.now()}`,
        x: to.x,
        y: to.y,
        tier: nextTier,
        category: this.getCategoryForTier(nextTier),
        isLocked: false,
        createdAt: Date.now(),
      };
      this.items.set(unit1.id, unit1);
      createdItems.push(unit1);

      // Unit 2 in adjacent empty cell if available
      const emptyAdj = this.getAdjacentEmptyCell(to);
      if (emptyAdj) {
        this.itemCounter++;
        const unit2: BoardItem = {
          id: `merged_${this.itemCounter}_${Date.now()}`,
          x: emptyAdj.x,
          y: emptyAdj.y,
          tier: nextTier,
          category: this.getCategoryForTier(nextTier),
          isLocked: false,
          createdAt: Date.now(),
        };
        this.items.set(unit2.id, unit2);
        createdItems.push(unit2);
      }

      // Spawn Solar Catalyst on another adjacent cell
      const catalystCell = this.getAdjacentEmptyCell(to);
      if (catalystCell) {
        this.itemCounter++;
        catalystItem = {
          id: `catalyst_${this.itemCounter}_${Date.now()}`,
          x: catalystCell.x,
          y: catalystCell.y,
          tier: 4,
          category: 'catalyst',
          modifier: 'catalyst_sun',
          isLocked: false,
          createdAt: Date.now(),
        };
        this.items.set(catalystItem.id, catalystItem);
        createdItems.push(catalystItem);
      }

      const codex = CODEX_ENTRIES.find(c => c.tier === nextTier) || CODEX_ENTRIES[0];
      scoreGained = (codex.stats.basePoints * 2.5 * 2); // 2 units + bonus multiplier

    } else if (mergeCount >= 3) {
      // --- 3-MERGE ---
      mergeType = '3_MERGE';
      const itemsToConsume = allCandidates.slice(0, 3);
      for (const item of itemsToConsume) {
        this.items.delete(item.id);
        removedIds.push(item.id);
      }

      this.itemCounter++;
      const upgraded: BoardItem = {
        id: `merged_${this.itemCounter}_${Date.now()}`,
        x: to.x,
        y: to.y,
        tier: nextTier,
        category: this.getCategoryForTier(nextTier),
        isLocked: false,
        createdAt: Date.now(),
      };
      this.items.set(upgraded.id, upgraded);
      createdItems.push(upgraded);

      const codex = CODEX_ENTRIES.find(c => c.tier === nextTier) || CODEX_ENTRIES[0];
      scoreGained = Math.floor(codex.stats.basePoints * 1.5);

    } else {
      // --- STANDARD 2-MERGE ---
      mergeType = '2_MERGE';
      this.items.delete(source.id);
      this.items.delete(target.id);
      removedIds.push(source.id, target.id);

      this.itemCounter++;
      const upgraded: BoardItem = {
        id: `merged_${this.itemCounter}_${Date.now()}`,
        x: to.x,
        y: to.y,
        tier: nextTier,
        category: this.getCategoryForTier(nextTier),
        isLocked: false,
        createdAt: Date.now(),
      };
      this.items.set(upgraded.id, upgraded);
      createdItems.push(upgraded);

      const codex = CODEX_ENTRIES.find(c => c.tier === nextTier) || CODEX_ENTRIES[0];
      scoreGained = codex.stats.basePoints;
    }

    this.score += scoreGained;
    this.totalMerges++;
    this.movesRemaining = Math.max(0, this.movesRemaining - 1);
    this.decrementAnomalies();

    // Impact adjacent anomalies
    const anomalyImpact = this.impactAdjacentAnomalies(to);

    this.actionLog.push({
      action: 'MERGE',
      from: [source.x, source.y],
      to: [to.x, to.y],
      sourceItemId: source.id,
      targetItemId: target.id,
      resultingTier: nextTier,
      timestamp: Date.now(),
    });

    return {
      success: true,
      type: mergeType,
      targetCell: to,
      createdItems,
      removedItemIds: removedIds,
      catalystSpawned: catalystItem,
      scoreGained,
      comboCount: mergeCount >= 5 ? 3 : (mergeCount >= 3 ? 2 : 1),
      shockwaveCenter: to,
      anomalyImpacted: anomalyImpact,
    };
  }

  /**
   * Find matching cluster of identical tier adjacent to cell
   */
  private findMatchingCluster(center: Coordinate, tier: number, ignoreIds: string[]): BoardItem[] {
    const cluster: BoardItem[] = [];
    const deltas = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
    ];

    for (const d of deltas) {
      const nx = center.x + d.dx;
      const ny = center.y + d.dy;
      if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
        const item = this.getItemAt(nx, ny);
        if (
          item &&
          item.tier === tier &&
          !ignoreIds.includes(item.id) &&
          !item.category.startsWith('branch_') &&
          item.category !== 'catalyst'
        ) {
          cluster.push(item);
        }
      }
    }
    return cluster;
  }

  private getAdjacentEmptyCell(origin: Coordinate): Coordinate | null {
    const deltas = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
    ];
    for (const d of deltas) {
      const nx = origin.x + d.dx;
      const ny = origin.y + d.dy;
      if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
        if (!this.getItemAt(nx, ny) && !this.getAnomalyAt(nx, ny)) {
          return { x: nx, y: ny };
        }
      }
    }
    return null;
  }

  private getCategoryForTier(tier: number): ItemCategory {
    if (tier <= 3) return 'earth';
    if (tier <= 6) return 'alloy';
    if (tier <= 9) return 'crystal';
    if (tier <= 11) return 'arcana';
    return 'solar';
  }

  // --------------------------------------------------
  // Anomaly Hazards & Turn Management
  // --------------------------------------------------

  public addAnomaly(anomaly: BoardAnomaly): void {
    this.anomalies.set(anomaly.id, anomaly);
  }

  private decrementAnomalies(): void {
    for (const [id, anomaly] of this.anomalies.entries()) {
      anomaly.turnsLeft -= 1;
      if (anomaly.turnsLeft <= 0) {
        // Anomaly crystallizes into a locked dead-weight obstacle
        this.anomalies.delete(id);
        this.itemCounter++;
        const obstacle: BoardItem = {
          id: `obstacle_${this.itemCounter}_${Date.now()}`,
          x: anomaly.x,
          y: anomaly.y,
          tier: 1,
          category: 'alloy',
          isLocked: true, // Permanent locked stone until cracked
          createdAt: Date.now(),
        };
        this.items.set(obstacle.id, obstacle);
      }
    }
  }

  private impactAdjacentAnomalies(cell: Coordinate): { id: string; cleared: boolean; rewardItem?: BoardItem } | undefined {
    for (const [id, anomaly] of this.anomalies.entries()) {
      const dx = Math.abs(anomaly.x - cell.x);
      const dy = Math.abs(anomaly.y - cell.y);
      if (dx <= 1 && dy <= 1) {
        anomaly.hitsTaken += 1;
        if (anomaly.hitsTaken >= anomaly.hitsRequired) {
          // Solved / shattered!
          this.anomalies.delete(id);
          this.score += 2500;

          // Spawn rare wildcard or catalyst reward
          this.itemCounter++;
          const reward: BoardItem = {
            id: `reward_${this.itemCounter}_${Date.now()}`,
            x: anomaly.x,
            y: anomaly.y,
            tier: anomaly.rewardTier,
            category: 'catalyst',
            modifier: 'overcharged',
            isLocked: false,
            createdAt: Date.now(),
          };
          this.items.set(reward.id, reward);

          return { id, cleared: true, rewardItem: reward };
        }
        return { id, cleared: false };
      }
    }
    return undefined;
  }

  // --------------------------------------------------
  // Inventory Pocket & Board Auto-Sort
  // --------------------------------------------------

  public storeInPocket(item: BoardItem): boolean {
    if (this.pocketItem) return false;
    this.saveHistoryState();
    this.items.delete(item.id);
    this.pocketItem = { ...item, x: -1, y: -1 };

    this.actionLog.push({
      action: 'USE_POCKET',
      sourceItemId: item.id,
      timestamp: Date.now(),
    });
    return true;
  }

  public retrievePocket(to: Coordinate): BoardItem | null {
    if (!this.pocketItem) return null;
    if (this.getItemAt(to.x, to.y) || this.getAnomalyAt(to.x, to.y)) return null;

    this.saveHistoryState();
    const item: BoardItem = { ...this.pocketItem, x: to.x, y: to.y };
    this.pocketItem = null;
    this.items.set(item.id, item);

    this.actionLog.push({
      action: 'USE_POCKET',
      to: [to.x, to.y],
      targetItemId: item.id,
      timestamp: Date.now(),
    });
    return item;
  }

  public trashItem(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item || item.isLocked) return false;

    this.saveHistoryState();
    this.items.delete(itemId);

    this.actionLog.push({
      action: 'TRASH',
      targetItemId: itemId,
      timestamp: Date.now(),
    });
    return true;
  }

  /**
   * Auto-sort grid: packs higher tiers at the top-left, grouping identicals together
   */
  public autoSort(): void {
    this.saveHistoryState();
    const itemList = Array.from(this.items.values()).filter(i => !i.isLocked);
    itemList.sort((a, b) => b.tier - a.tier || a.category.localeCompare(b.category));

    const sortedSlots: Coordinate[] = [];
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        if (!this.getAnomalyAt(x, y)) {
          const existing = this.getItemAt(x, y);
          if (!existing || !existing.isLocked) {
            sortedSlots.push({ x, y });
          }
        }
      }
    }

    for (let i = 0; i < itemList.length && i < sortedSlots.length; i++) {
      const item = itemList[i];
      item.x = sortedSlots[i].x;
      item.y = sortedSlots[i].y;
    }

    this.actionLog.push({
      action: 'SORT',
      timestamp: Date.now(),
    });
  }

  // --------------------------------------------------
  // Command Pattern History Stack (20-Step Undo/Redo)
  // --------------------------------------------------

  private saveHistoryState(): void {
    const snapshot = this.createSnapshot();
    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo tree on new action
  }

  public createSnapshot(): BoardSnapshot {
    return {
      grid: this.getGrid(),
      items: Array.from(this.items.values()).map(i => ({ ...i })),
      anomalies: Array.from(this.anomalies.values()).map(a => ({ ...a })),
      pocketItem: this.pocketItem ? { ...this.pocketItem } : null,
      score: this.score,
      movesRemaining: this.movesRemaining,
      totalMerges: this.totalMerges,
      maxTierAchieved: this.maxTierAchieved,
      spawnerCharges: this.spawnerCharges,
    };
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const current = this.createSnapshot();
    this.redoStack.push(current);

    const prev = this.undoStack.pop()!;
    this.restoreSnapshot(prev);
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const current = this.createSnapshot();
    this.undoStack.push(current);

    const next = this.redoStack.pop()!;
    this.restoreSnapshot(next);
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private restoreSnapshot(snap: BoardSnapshot): void {
    this.items.clear();
    for (const item of snap.items) {
      this.items.set(item.id, { ...item });
    }
    this.anomalies.clear();
    for (const anom of snap.anomalies) {
      this.anomalies.set(anom.id, { ...anom });
    }
    this.pocketItem = snap.pocketItem ? { ...snap.pocketItem } : null;
    this.score = snap.score;
    this.movesRemaining = snap.movesRemaining;
    this.totalMerges = snap.totalMerges;
    this.maxTierAchieved = snap.maxTierAchieved;
    this.spawnerCharges = snap.spawnerCharges;
  }

  // --------------------------------------------------
  // Direct Item Mutation (for Initial Setups & Seeds)
  // --------------------------------------------------

  public addItemDirectly(item: BoardItem): void {
    this.items.set(item.id, { ...item });
    if (item.tier > this.maxTierAchieved) {
      this.maxTierAchieved = item.tier;
    }
  }

  public clear(): void {
    this.items.clear();
    this.anomalies.clear();
    this.pocketItem = null;
    this.score = 0;
    this.totalMerges = 0;
    this.movesRemaining = this.moveBudget;
    this.spawnerCharges = 15;
    this.undoStack = [];
    this.redoStack = [];
    this.actionLog = [];
  }
}
