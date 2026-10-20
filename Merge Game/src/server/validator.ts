// ----------------------------------------------------
// Server-Authoritative Puzzle Generator & Run Validator
// ----------------------------------------------------

import { MergeEngine } from '../engine/mergeEngine';
import { PRNG } from '../engine/prng';
import type { DailySeedData, UserActionLog, VerificationResult, BoardItem, BoardAnomaly } from '../engine/types';
import { CODEX_ENTRIES } from '../engine/codex';

/**
 * Returns UTC-based daily seed string (e.g. "ALCH-2026-10-14")
 */
export function getDailySeedString(customDate?: Date): string {
  const d = customDate || new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `ALCH-${year}-${month}-${day}`;
}

/**
 * Generates deterministic daily challenge board setup
 */
export function generateDailyChallenge(seedString?: string): DailySeedData {
  const seed = seedString || getDailySeedString();
  const prng = new PRNG(seed);
  const boardSize = 7;
  const moveBudget = 50;

  // Place initial anomaly in central area
  const anomalyX = prng.nextInt(2, 4);
  const anomalyY = prng.nextInt(2, 4);

  const initialAnomaly: BoardAnomaly = {
    id: `anomaly_${seed}`,
    x: anomalyX,
    y: anomalyY,
    type: prng.choice(['rift', 'geode', 'corruption']),
    turnsLeft: 10,
    maxTurns: 10,
    hitsRequired: 3,
    hitsTaken: 0,
    rewardTier: 5, // Quicksilver Alembic / high-value catalyst
  };

  // Place 12 deterministic initial items scattered across grid
  const initialItems: BoardItem[] = [];
  const occupied = new Set<string>();
  occupied.add(`${anomalyX},${anomalyY}`);

  let itemIdx = 0;
  while (initialItems.length < 12) {
    const rx = prng.nextInt(0, boardSize - 1);
    const ry = prng.nextInt(0, boardSize - 1);
    const key = `${rx},${ry}`;

    if (!occupied.has(key)) {
      occupied.add(key);
      itemIdx++;

      // Weights: mostly tier 1, some tier 2, rarely tier 3
      const roll = prng.next();
      const tier = roll < 0.65 ? 1 : (roll < 0.90 ? 2 : 3);
      const category = 'earth';

      initialItems.push({
        id: `seed_item_${itemIdx}`,
        x: rx,
        y: ry,
        tier,
        category,
        isLocked: false,
        createdAt: 0,
      });
    }
  }

  return {
    seed,
    dateKey: seed.replace('ALCH-', ''),
    boardSize,
    moveBudget,
    initialItems,
    initialAnomaly,
    targetGoalTier: 10,
  };
}

/**
 * Headless server replay validation routine (Anti-Cheat)
 */
export function verifyRunSimulation(payload: {
  seed: string;
  actions: UserActionLog[];
  claimedScore?: number;
  claimedTier?: number;
}): VerificationResult {
  const { seed, actions, claimedScore, claimedTier } = payload;

  const challenge = generateDailyChallenge(seed);
  const engine = new MergeEngine({
    boardSize: challenge.boardSize,
    seed: seed + '-SESSION',
    moveBudget: challenge.moveBudget,
  });

  // Populate board from deterministic daily initial state
  for (const item of challenge.initialItems) {
    engine.addItemDirectly(item);
  }
  engine.addAnomaly(challenge.initialAnomaly);

  // Replay actions
  let actionCount = 0;
  for (const act of actions) {
    actionCount++;
    if (act.action === 'SPAWN') {
      const preferred = act.to ? { x: act.to[0], y: act.to[1] } : undefined;
      const spawned = engine.spawnItem(preferred);
      if (!spawned && engine.spawnerCharges <= 0 && !engine.isBoardFull()) {
        return {
          valid: false,
          score: engine.score,
          highestTier: engine.maxTierAchieved,
          totalMerges: engine.totalMerges,
          movesUsed: challenge.moveBudget - engine.movesRemaining,
          boardOverflows: engine.boardOverflows,
          badgeEmoji: '❌',
          badgeText: 'Invalid spawn action executed without charges.',
          errorReason: `Action #${actionCount}: Spawner had no charges remaining`,
        };
      }
    } else if (act.action === 'MERGE') {
      if (!act.from || !act.to) continue;
      const res = engine.moveOrMerge(
        { x: act.from[0], y: act.from[1] },
        { x: act.to[0], y: act.to[1] }
      );
      if (!res.success && res.type === 'INVALID') {
        // Ignored or invalid move
      }
    } else if (act.action === 'SORT') {
      engine.autoSort();
    } else if (act.action === 'USE_POCKET') {
      if (act.to) {
        engine.retrievePocket({ x: act.to[0], y: act.to[1] });
      } else if (act.sourceItemId) {
        const item = engine.getItems().find(i => i.id === act.sourceItemId);
        if (item) engine.storeInPocket(item);
      }
    } else if (act.action === 'TRASH') {
      if (act.targetItemId) {
        engine.trashItem(act.targetItemId);
      }
    }
  }

  // Anti-cheat verification
  if (claimedScore !== undefined && Math.abs(claimedScore - engine.score) > 100) {
    return {
      valid: false,
      score: engine.score,
      highestTier: engine.maxTierAchieved,
      totalMerges: engine.totalMerges,
      movesUsed: challenge.moveBudget - engine.movesRemaining,
      boardOverflows: engine.boardOverflows,
      badgeEmoji: '⚠️',
      badgeText: `Score desynchronization detected: Claimed ${claimedScore} vs Simulated ${engine.score}`,
      errorReason: 'Score desync detected in authoritative replay',
    };
  }

  if (claimedTier !== undefined && claimedTier > engine.maxTierAchieved) {
    return {
      valid: false,
      score: engine.score,
      highestTier: engine.maxTierAchieved,
      totalMerges: engine.totalMerges,
      movesUsed: challenge.moveBudget - engine.movesRemaining,
      boardOverflows: engine.boardOverflows,
      badgeEmoji: '⚠️',
      badgeText: `Tier desynchronization detected: Claimed Tier ${claimedTier} vs Simulated Tier ${engine.maxTierAchieved}`,
      errorReason: 'Max tier desync detected in authoritative replay',
    };
  }

  // Generate verified performance badge
  const tierEntry = CODEX_ENTRIES.find(c => c.tier === engine.maxTierAchieved) || CODEX_ENTRIES[0];
  const movesUsed = challenge.moveBudget - engine.movesRemaining;

  const emojiIcons = ['🌱', '🌿', '🪨', '⚒️', '🧪', '⚔️', '💎', '🔔', '⌛', '👁️', '🪐', '☀️'];
  const rankEmoji = emojiIcons[Math.min(engine.maxTierAchieved - 1, emojiIcons.length - 1)];

  const badgeText = `⚗️ ${rankEmoji} 🌟 [Tier ${engine.maxTierAchieved} ${tierEntry.name} // ${engine.totalMerges} Merges // ${engine.boardOverflows} Board Overflows // ${engine.score.toLocaleString()} PTS]`;

  return {
    valid: true,
    score: engine.score,
    highestTier: engine.maxTierAchieved,
    totalMerges: engine.totalMerges,
    movesUsed,
    boardOverflows: engine.boardOverflows,
    badgeEmoji: `${rankEmoji} ⚗️`,
    badgeText,
  };
}
