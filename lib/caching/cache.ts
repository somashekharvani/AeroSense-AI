interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttlMs: number;
}

export class MemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number;

  constructor(maxEntries = 200) {
    this.maxEntries = maxEntries;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    if (this.store.size >= this.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttlMs,
    });
  }

  get<T>(key: string): { data: T | null; isStale: boolean; exists: boolean } {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return { data: null, isStale: false, exists: false };
    }

    const age = Date.now() - entry.timestamp;
    const isExpired = age > entry.ttlMs;

    return {
      data: entry.value,
      isStale: isExpired,
      exists: true,
    };
  }

  clear(): void {
    this.store.clear();
  }
}

// Global server-side cache instance
const globalCache = new MemoryCache();

export const CACHE_TTL = {
  SNAPSHOT: 10 * 60 * 1000, // 10 minutes
  AIR_QUALITY: 15 * 60 * 1000, // 15 minutes
  WEATHER: 30 * 60 * 1000, // 30 minutes
  FIRES: 60 * 60 * 1000, // 60 minutes
  STATIONS: 15 * 60 * 1000, // 15 minutes
};

export default globalCache;
