/**
 * Mulberry32 32-bit Seeded PRNG.
 * Provides deterministic pseudo-random sequences for globally synchronized Daily Vaults.
 */
export function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fast string hashing to 32-bit integer.
 */
export function hashStringToSeed(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Returns current date in ISO format YYYY-MM-DD (UTC/Local aligned).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a deterministic daily target between min and max based on ISO date.
 */
export function getDailyTarget(dateStr: string = getTodayDateString(), min = 1, max = 100): number {
  const seedKey = `THE_VAULT_PROTOCOL_SALT_${dateStr}`;
  const seed = hashStringToSeed(seedKey);
  const prng = mulberry32(seed);
  // Warm up generator
  prng();
  prng();
  const range = max - min + 1;
  return min + Math.floor(prng() * range);
}

/**
 * Cryptographically random integer generation for casual drills.
 */
export function getRandomTarget(min = 1, max = 100): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const range = max - min + 1;
    return min + (array[0] % range);
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}
