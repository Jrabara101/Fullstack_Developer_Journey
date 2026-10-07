import { ItemEntity, PlacedItem } from '../types/inventory';

export function getItemDimensions(item: ItemEntity, isRotated: boolean): { width: number; height: number } {
  if (isRotated) {
    return { width: item.height, height: item.width };
  }
  return { width: item.width, height: item.height };
}

/**
 * Builds a 2D occupancy matrix representing the current items on the grid.
 * Matrix is row-major: matrix[y][x] contains item UID or null.
 */
export function buildOccupancyGrid(
  items: PlacedItem[],
  cols: number,
  rows: number,
  ignoreUid?: string
): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => null)
  );

  for (const placed of items) {
    if (ignoreUid && placed.item.uid === ignoreUid) continue;

    const { width, height } = getItemDimensions(placed.item, placed.item.isRotated);
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const targetX = placed.x + dx;
        const targetY = placed.y + dy;
        if (targetX < cols && targetY < rows) {
          grid[targetY][targetX] = placed.item.uid;
        }
      }
    }
  }

  return grid;
}

/**
 * Validates whether an item of given dimensions and rotation can be placed at (targetX, targetY).
 */
export function canPlaceItem(
  currentItems: PlacedItem[],
  item: ItemEntity,
  targetX: number,
  targetY: number,
  isRotated: boolean,
  cols: number = 10,
  rows: number = 6,
  ignoreUid?: string
): boolean {
  const { width, height } = getItemDimensions(item, isRotated);

  // Boundary checks
  if (targetX < 0 || targetY < 0) return false;
  if (targetX + width > cols) return false;
  if (targetY + height > rows) return false;

  const occupancy = buildOccupancyGrid(currentItems, cols, rows, ignoreUid);

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const cellY = targetY + dy;
      const cellX = targetX + dx;
      if (occupancy[cellY][cellX] !== null) {
        return false; // Cell is already occupied
      }
    }
  }

  return true;
}

/**
 * Finds the first available open grid slot for an item.
 * Tries normal orientation first, then rotated orientation if not possible.
 */
export function findAvailableSlot(
  currentItems: PlacedItem[],
  item: ItemEntity,
  cols: number = 10,
  rows: number = 6
): { x: number; y: number; isRotated: boolean } | null {
  // Try normal orientation
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (canPlaceItem(currentItems, item, x, y, false, cols, rows)) {
        return { x, y, isRotated: false };
      }
    }
  }

  // Try rotated orientation if item is not square
  if (item.width !== item.height) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (canPlaceItem(currentItems, item, x, y, true, cols, rows)) {
          return { x, y, isRotated: true };
        }
      }
    }
  }

  return null;
}

/**
 * 2D Bin Packing auto-sort algorithm:
 * Orders items by volume/area descending (largest items first: 2x3, 2x2, 1x3, 1x2, 1x1),
 * secondary sorted by rarity and value, then packs them tightly from top-left.
 */
export function autoSort2DBinPacking(
  items: PlacedItem[],
  cols: number = 10,
  rows: number = 6
): { packedItems: PlacedItem[]; overflowItems: ItemEntity[] } {
  // Sort items: Area desc -> Rarity desc -> Gold value desc
  const rarityRank: Record<string, number> = {
    legendary: 5,
    epic: 4,
    rare: 3,
    uncommon: 2,
    common: 1,
  };

  const itemPool = [...items.map(p => ({ ...p.item }))].sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    if (areaB !== areaA) return areaB - areaA;

    const rankA = rarityRank[a.rarity] || 0;
    const rankB = rarityRank[b.rarity] || 0;
    if (rankB !== rankA) return rankB - rankA;

    return b.valueGold - a.valueGold;
  });

  const packed: PlacedItem[] = [];
  const overflow: ItemEntity[] = [];

  for (const item of itemPool) {
    const slot = findAvailableSlot(packed, item, cols, rows);
    if (slot) {
      packed.push({
        item: { ...item, isRotated: slot.isRotated },
        x: slot.x,
        y: slot.y,
      });
    } else {
      overflow.push(item);
    }
  }

  return { packedItems: packed, overflowItems: overflow };
}
