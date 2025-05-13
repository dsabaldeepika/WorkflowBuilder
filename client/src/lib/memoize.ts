/**
 * Simple in-memory cache with expiration
 */
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

interface MemoizeOptions {
  /**
   * TTL in milliseconds
   */
  ttl: number;
  /**
   * Maximum number of cache entries
   */
  maxSize?: number;
}

/**
 * Options for memoizeWithTTL
 */
interface MemoizeWithTTLOptions {
  /**
   * Time-to-live in milliseconds
   */
  ttl: number;
  /**
   * Maximum number of cache entries
   */
  maxSize?: number;
}

/**
 * Cache for memoized functions
 */
const memoCache = new Map<string, Map<string, CacheEntry<any>>>();

/**
 * Calculate a cache key from function arguments
 */
function calculateCacheKey(args: any[]): string {
  return JSON.stringify(args);
}

/**
 * Memoize a function with TTL and maxSize limits
 * @param fn Function to memoize
 * @param options Cache options
 * @returns Memoized function
 */
export function memoize<T, Args extends any[]>(
  fn: (...args: Args) => T | Promise<T>, 
  options: MemoizeOptions
): (...args: Args) => T | Promise<T> {
  const fnName = fn.name || Math.random().toString(36).substring(2, 9);
  
  if (!memoCache.has(fnName)) {
    memoCache.set(fnName, new Map<string, CacheEntry<any>>());
  }
  
  const fnCache = memoCache.get(fnName)!;
  
  return async (...args: Args): Promise<T> => {
    // Calculate cache key from arguments
    const cacheKey = calculateCacheKey(args);
    const now = Date.now();
    
    // Check if we have a valid cache entry
    const entry = fnCache.get(cacheKey);
    if (entry && entry.expiry > now) {
      return entry.value;
    }
    
    // Execute function and cache result
    const result = await fn(...args);
    
    // Maintain max cache size
    if (options.maxSize && fnCache.size >= options.maxSize) {
      // Remove oldest entry (first-in-first-out)
      const oldestKey = fnCache.keys().next().value;
      fnCache.delete(oldestKey);
    }
    
    // Add result to cache
    fnCache.set(cacheKey, {
      value: result,
      expiry: now + options.ttl
    });
    
    return result;
  };
}

/**
 * Cleanup expired cache entries
 */
export function cleanupMemoCache(): void {
  const now = Date.now();
  
  memoCache.forEach((fnCache, fnName) => {
    fnCache.forEach((entry, key) => {
      if (entry.expiry <= now) {
        fnCache.delete(key);
      }
    });
    
    // Remove function from cache if no entries left
    if (fnCache.size === 0) {
      memoCache.delete(fnName);
    }
  });
}

// Clean up expired cache entries every 5 minutes
setInterval(cleanupMemoCache, 5 * 60 * 1000);

/**
 * A simpler memoization function with just TTL options
 * This is a convenience wrapper around the more complex memoize function
 * 
 * @param fn Function to memoize
 * @param options TTL and optional max size
 * @returns Memoized function
 */
export function memoizeWithTTL<T, Args extends any[]>(
  fn: (...args: Args) => T | Promise<T>,
  options: MemoizeWithTTLOptions
): (...args: Args) => T | Promise<T> {
  return memoize(fn, {
    ttl: options.ttl,
    maxSize: options.maxSize || 100
  });
}