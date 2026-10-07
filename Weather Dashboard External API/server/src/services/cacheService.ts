interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();

  /**
   * Rounds coordinates to 2 decimal places (~1.1 km grid resolution)
   * as specified in the architecture requirements.
   */
  public getCoordKey(lat: number, lon: number, prefix = 'weather'): string {
    const roundedLat = lat.toFixed(2);
    const roundedLon = lon.toFixed(2);
    return `${prefix}:${roundedLat}:${roundedLon}`;
  }

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  public async clear(): Promise<void> {
    this.memoryCache.clear();
  }
}

export const cacheService = new CacheService();
