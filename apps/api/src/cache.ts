type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export const searchCache = new MemoryCache();
export const offerCache = new MemoryCache();

/** Search result cache TTL — prices move fast */
export const SEARCH_TTL_MS = 8 * 60 * 1000;
export const OFFER_TTL_MS = 15 * 60 * 1000;
