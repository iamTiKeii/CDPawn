interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache {
  private static cache = new Map<string, CacheEntry<any>>();

  /**
   * Get an item from the cache. Returns null if not found or expired.
   */
  public static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set an item in the cache with a specific TTL in milliseconds (default 5 minutes).
   */
  public static set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete a specific key from the cache.
   */
  public static delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries.
   */
  public static clear(): void {
    this.cache.clear();
  }

  /**
   * Clear all cache keys matching a specific prefix pattern.
   * e.g., "stores:", "commodities:"
   */
  public static deletePattern(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}
