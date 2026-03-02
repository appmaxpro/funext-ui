import { sortBy } from "lodash";

type CacheEntry<T> = {
  value: T;
  accessAt: number;
  writeAt: number;
  accessCount: number;
};

/**
 * Cache options.
 *
 */
export type CacheOptions = {
  /**
   * Maximum number of entries in the cache.
   */
  maxCount?: number;

  /**
   * Minimum number of hits before an entry is evicted.
   */
  minHits?: number;

  /**
   * Minimum time in milliseconds before an entry is evicted.
   */
  minTime?: number;

  evictEvery?: number;
};

type EntryArr<T> = [key: string, entry: CacheEntry<T>];

/**
 * A cache that evicts old and least used entries.
 *
 */
export class Cache<T> {
  #cache: Map<string, CacheEntry<T>>;
  #options: Required<CacheOptions>;
  #lastEvict: number = 0;
  /**
   * Create a new cache.
   *
   * @param options Cache options.
   */
  constructor(options: CacheOptions = {}) {
    this.#cache = new Map();
    this.#options = {
      maxCount: options.maxCount || 1000,
      minHits: options.minHits || 5,
      minTime: options.minTime || 1000 * 60 * 60,
      evictEvery: options.evictEvery || 10 * 1000
    };
  }

  /**
   * Clear the cache.
   */
  clear() {
    this.#cache.clear();
  }

  /**
   * Remove an entry from the cache.
   *
   * @param key cache key
   */
  delete(key: string) {
    this.#cache.delete(key);
  }

  /**
   * Get an entry from the cache.
   *
   * @param key cache key
   * @returns cached value or undefined if not found
   */
  get(key: string): T | undefined {
    const entry = this.#cache.get(key);
    if (entry !== undefined) {
      this.#cache.delete(key);
      entry.accessAt = Date.now();
      entry.accessCount += 1;
      this.#cache.set(key, entry);
      return entry.value;
    }
  }

  /**
   * Put an entry in the cache.
   *
   * @param key cache key
   * @param value the value to cache
   */
  put(key: string, value: T) {
    // evict old and least used entries
    this.#evictLeastUsed();
    const now = Date.now();
    this.#cache.set(key, {
      accessAt: now + this.#options.minTime ,
      writeAt: now,
      accessCount: 1,
      value,
    });
  }

  has(key: string): boolean {
    return this.#cache.has(key);
  }
  
  #evict() {
    const now = Date.now();
    const minTime = this.#options.minTime;
    const minHits = this.#options.minHits;
    const cache = this.#cache;

    for (const [key, entry] of Array.from(this.#cache.entries())) {
      const diff1 =  now - entry.writeAt;
      const diff2 = now - entry.accessAt;
      const hits = entry.accessCount;
      if (hits < minHits && diff1 >= minTime && diff2 < minTime ) {
        cache.delete(key);
      }
    }

    let sorted = Array.from(cache.entries())
      .sort((n1, n2) =>n2[1].accessAt >= n1[1].accessAt ? 1 : -1)
      .sort((n1, n2) =>n1[1].accessCount >= n2[1].accessCount ? 1 : -1);


    this.#lastEvict = now;
    if (sorted.length > this.#options.maxCount){
      let toDele = sorted.length - this.#options.maxCount;
      for(let i = 0; i < toDele; i++) {
        cache.delete(sorted[i][0]);
      }
    }
  }
  #evictLeastUsed() {
    if(!this.#cache.size)
      return;
    
    const now = Date.now();
    if((now - this.#lastEvict) < this.#options.evictEvery) {
      this.#evict();
      return;
    }
    
  }
}

/**
 * A cache that loads values on cache misses.
 *
 */
export class LoadingCache<T> extends Cache<T> {
  /**
   * Get an entry from the cache or load it if not found.
   *
   * @param key cache key
   * @param loader function to load the value
   * @returns cached value or loaded value
   */
  get(key: string): T | undefined;
  get(key: string, loader: (key: string) => T): T;
  get(key: string, loader?: (key: string) => T): T | undefined {
    let value = super.get(key);
    if (value !== undefined) {
      return value;
    }

    if (loader !== undefined) {
      value = loader(key);
      this.put(key, value);
      if (value instanceof Promise) { 
        value.catch(() => {
          this.delete(key);
        });
      }
    }

    return value;
  }
}
