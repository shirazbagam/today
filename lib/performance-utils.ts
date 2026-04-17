/**
 * Performance Optimization Utilities
 * Addresses 8 medium priority performance issues:
 * - Memory leaks from uncleared listeners
 * - Inefficient re-renders
 * - N+1 query patterns
 * - Missing pagination for large datasets
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Prevents memory leaks by automatically cleaning up listeners
 * Used for: Socket.io, EventEmitter, Observable subscriptions
 * 
 * @example
 * const cleanup = useAutoCleanup();
 * useEffect(() => {
 *   socket.on('event', callback);
 *   cleanup.add(() => socket.off('event', callback));
 * }, []);
 */
export function useAutoCleanup() {
  const cleanupFns = useRef<Array<() => void>>([]);

  useEffect(() => {
    return () => {
      cleanupFns.current.forEach(fn => {
        try {
          fn();
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      });
      cleanupFns.current = [];
    };
  }, []);

  return {
    add: (fn: () => void) => {
      cleanupFns.current.push(fn);
    },
    run: () => {
      cleanupFns.current.forEach(fn => fn());
      cleanupFns.current = [];
    }
  };
}

/**
 * Prevents unlimited re-renders with render count tracking
 * Helps identify performance bottlenecks
 */
export function useRenderCount() {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    if (__DEV__ && renderCount.current > 3) {
      console.warn(`Component re-rendered ${renderCount.current} times (consider memoization)`);
    }
  });

  return renderCount.current;
}

/**
 * Implements client-side pagination for large datasets
 * Prevents memory overload from loading all items at once
 * 
 * @example
 * const { items, page, pageSize, nextPage, canLoadMore } = usePagination(allItems, 50);
 */
export function usePagination<T>(
  items: T[],
  pageSize: number = 50
) {
  const [page, setPage] = React.useState(0);

  const paginatedItems = items.slice(0, (page + 1) * pageSize);
  const hasMore = paginatedItems.length < items.length;

  return {
    items: paginatedItems,
    page,
    pageSize,
    totalItems: items.length,
    nextPage: () => setPage(p => p + 1),
    reset: () => setPage(0),
    canLoadMore: hasMore
  };
}

/**
 * Implements request timeout to prevent hanging requests
 * Wraps fetch with automatic timeout cancellation
 * 
 * @example
 * const response = await fetchWithTimeout(url, { timeout: 5000 });
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = 5000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw err;
  }
}

/**
 * Implements request retry with exponential backoff
 * Retries failed requests with increasing delays
 * 
 * @example
 * const response = await retryRequest(
 *   () => fetch(url),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
  } = {}
) {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === maxRetries) break;

      const delay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );
      
      if (__DEV__) {
        console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * Implements response caching to avoid duplicate API calls
 * Caches responses for configurable duration
 * 
 * @example
 * const cached = createRequestCache(5 * 60 * 1000); // 5 min TTL
 * const data = await cached.get(url, () => fetch(url));
 */
export function createRequestCache(ttl: number = 5 * 60 * 1000) {
  const cache = new Map<string, { data: any; expires: number }>();

  return {
    get: async <T,>(
      key: string,
      fetcher: () => Promise<T>
    ): Promise<T> => {
      const cached = cache.get(key);

      if (cached && cached.expires > Date.now()) {
        if (__DEV__) console.log(`Cache hit: ${key}`);
        return cached.data as T;
      }

      const data = await fetcher();
      cache.set(key, {
        data,
        expires: Date.now() + ttl
      });

      return data;
    },
    clear: () => cache.clear(),
    invalidate: (key: string) => cache.delete(key)
  };
}

/**
 * Implements efficient duplicate prevention for array operations
 * O(n) instead of O(n²) for large datasets
 * 
 * @example
 * const unique = deduplicateOnce(items, item => item.id);
 */
export function deduplicateOnce<T>(
  items: T[],
  getKey: (item: T) => string | number
): T[] {
  const seen = new Set<string | number>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * Implements debounce with immediate callback option for form inputs
 * Prevents excessive API calls while typing
 * 
 * @example
 * const handleSearch = useDebounceCallback(
 *   (query) => searchAPI(query),
 *   500
 * );
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: { immediate?: boolean } = {}
) {
  const { immediate = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hasCalledRef = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (immediate && !hasCalledRef.current) {
        callback(...args);
        hasCalledRef.current = true;
      }

      timeoutRef.current = setTimeout(() => {
        if (!immediate) {
          callback(...args);
        }
        hasCalledRef.current = false;
      }, delay);
    },
    [callback, delay, immediate]
  );
}

/**
 * Batch API calls to reduce N+1 query patterns
 * Collects multiple calls and executes in single batch
 * 
 * @example
 * const batcher = createBatcher((ids) => fetchUsers(ids), 50);
 * const user1 = await batcher.batch(1);
 * const user2 = await batcher.batch(2); // Both in same request
 */
export function createBatcher<K, V>(
  batchFn: (keys: K[]) => Promise<Map<K, V>>,
  batchSize: number = 50
) {
  let batch: K[] = [];
  let batchResolve: ((result: Map<K, V>) => void) | null = null;
  let batchPromise: Promise<Map<K, V>> | null = null;

  return {
    batch: async (key: K): Promise<V> => {
      batch.push(key);

      if (!batchPromise) {
        batchPromise = new Promise(resolve => {
          batchResolve = resolve;
          
          if (batch.length >= batchSize) {
            executeNow();
          } else {
            // Execute after tick if not enough items
            setTimeout(executeNow, 0);
          }
        });
      }

      const result = await batchPromise;
      return result.get(key) as V;
    }
  };

  function executeNow() {
    if (batch.length === 0) return;

    const currentBatch = batch;
    batch = [];
    batchPromise = null;

    batchFn(currentBatch)
      .then(result => batchResolve?.(result))
      .catch(err => {
        console.error('Batch error:', err);
        batchResolve?.(new Map());
      });
  }
}

/**
 * Monitors component performance and logs slowdowns
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (__DEV__ && duration > 100) {
        console.warn(`⚠️ Component ${componentName} took ${duration.toFixed(2)}ms to unmount`);
      }
    };
  }, [componentName]);
}

// Re-export React for convenience
import React from 'react';
