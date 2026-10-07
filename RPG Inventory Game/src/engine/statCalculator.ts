import { CharacterSheet, ComputedCharacterStats, ItemEntity, StatDifferential } from '../types/inventory';

export function computeCharacterStats(sheet: CharacterSheet): ComputedCharacterStats {
  const base = sheet.baseStats;

  let totalStr = base.strength;
  let totalDex = base.dexterity;
  let totalInt = base.intelligence;
  let flatAttack = 15; // Unarmed base attack
  let flatArmor = 10;  // Base natural armor
  let critPercent = 5.0; // Base 5% crit
  let hastePercent = 0.0;
  let totalStamina = 50 + base.strength * 1.2;

  // Equipment stats calculation
  const equippedItems = Object.values(sheet.equipped).filter((item): item is ItemEntity => Boolean(item));

  for (const item of equippedItems) {
    if (item.stats.strength) totalStr += item.stats.strength;
    if (item.stats.dexterity) totalDex += item.stats.dexterity;
    if (item.stats.intelligence) totalInt += item.stats.intelligence;
    if (item.stats.attackPower) flatAttack += item.stats.attackPower;
    if (item.stats.armor) flatArmor += item.stats.armor;
    if (item.stats.critChance) critPercent += item.stats.critChance;
    if (item.stats.elementalHaste) hastePercent += item.stats.elementalHaste;
    if (item.stats.stamina) totalStamina += item.stats.stamina;
  }

  // Derived synergy calculations:
  // Strength increases attack power (2.2 per STR point)
  const attackPower = Math.round(flatAttack + totalStr * 2.2);

  // Dexterity scales crit chance (0.12% per DEX)
  critPercent = parseFloat((critPercent + totalDex * 0.12).toFixed(1));

  // Intelligence scales elemental haste (0.15% per INT)
  hastePercent = parseFloat((hastePercent + totalInt * 0.15).toFixed(1));

  // Weight Calculation: equipped items + inventory items
  let totalWeight = 0;
  for (const item of equippedItems) {
    totalWeight += item.stats.weight || 0;
  }
  for (const placed of sheet.inventoryGrid.items) {
    const stack = placed.item.stackCount || 1;
    totalWeight += (placed.item.stats.weight || 0) * stack;
  }
  totalWeight = parseFloat(totalWeight.toFixed(1));

  const maxWeight = sheet.maxCarryWeight;
  const encumbrancePercent = Math.min(150, Math.round((totalWeight / maxWeight) * 100));
  const isOverburdened = totalWeight > maxWeight;

  // Encumbrance penalties
  let movementPenaltyPercent = 0;
  let staminaRecoveryPenaltyPercent = 0;

  if (encumbrancePercent > 80 && encumbrancePercent <= 100) {
    movementPenaltyPercent = Math.round((encumbrancePercent - 80) * 1.0); // up to -20%
    staminaRecoveryPenaltyPercent = Math.round((encumbrancePercent - 80) * 1.5); // up to -30%
  } else if (encumbrancePercent > 100) {
    movementPenaltyPercent = Math.min(65, 20 + Math.round((encumbrancePercent - 100) * 1.5));
    staminaRecoveryPenaltyPercent = Math.min(80, 30 + Math.round((encumbrancePercent - 100) * 2.0));
  }

  return {
    strength: totalStr,
    dexterity: totalDex,
    intelligence: totalInt,
    attackPower,
    armor: flatArmor,
    critChance: critPercent,
    elementalHaste: hastePercent,
    stamina: Math.round(totalStamina),
    totalWeight,
    maxWeight,
    encumbrancePercent,
    isOverburdened,
    movementPenaltyPercent,
    staminaRecoveryPenaltyPercent,
  };
}

/**
 * Compares an incoming candidate item with the currently equipped item in that slot
 * to generate dynamic colored +/- differential pills
 */
export function compareItemStats(
  candidate: ItemEntity,
  currentEquipped: ItemEntity | null
): StatDifferential[] {
  const diffs: StatDifferential[] = [];

  const candidateStats = candidate.stats;
  const currentStats = currentEquipped ? currentEquipped.stats : null;

  function pushDiff(
    label: string, 
    candVal: number | undefined, 
    currVal: number | undefined, 
    unit = '', 
    isPositiveGood = true
  ) {
    const cv = candVal || 0;
    const cur = currVal || 0;
    const delta = parseFloat((cv - cur).toFixed(1));

    if (delta !== 0) {
      const sign = delta > 0 ? '+' : '';
      diffs.push({
        label,
        diff: delta,
        isPositiveGood,
        formatted: `${sign}${delta}${unit} ${label}`,
      });
    }
  }

  pushDiff('Attack', candidateStats.attackPower, currentStats?.attackPower, ' Atk');
  pushDiff('Armor', candidateStats.armor, currentStats?.armor, ' Def');
  pushDiff('Strength', candidateStats.strength, currentStats?.strength, ' Str');
  pushDiff('Dexterity', candidateStats.dexterity, currentStats?.dexterity, ' Dex');
  pushDiff('Intelligence', candidateStats.intelligence, currentStats?.intelligence, ' Int');
  pushDiff('Crit Chance', candidateStats.critChance, currentStats?.critChance, '%');
  pushDiff('Haste', candidateStats.elementalHaste, currentStats?.elementalHaste, '%');
  pushDiff('Weight', candidateStats.weight, currentStats?.weight, 'kg', false); // Heavier is worse

  return diffs;
}
