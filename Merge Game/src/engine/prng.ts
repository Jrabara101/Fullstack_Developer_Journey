// ----------------------------------------------------
// Deterministic Seedable PRNG (Mulberry32)
// ----------------------------------------------------

export class PRNG {
  private state: number;
  private readonly initialSeed: number;

  constructor(seed: string | number) {
    if (typeof seed === 'string') {
      this.initialSeed = PRNG.hashString(seed);
    } else {
      this.initialSeed = seed >>> 0;
    }
    this.state = this.initialSeed;
  }

  /**
   * Hashes a string into a 32-bit unsigned integer using Murmur/DJB2 blend.
   */
  public static hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * Returns pseudo-random float in range [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns integer in range [min, max] inclusive
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Picks a random element from an array
   */
  public choice<T>(items: T[]): T {
    const idx = Math.floor(this.next() * items.length);
    return items[idx];
  }

  /**
   * Shuffles an array deterministically (Fisher-Yates)
   */
  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  public getState(): number {
    return this.state;
  }

  public setState(state: number): void {
    this.state = state >>> 0;
  }

  public reset(): void {
    this.state = this.initialSeed;
  }
}
