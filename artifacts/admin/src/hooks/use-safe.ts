/**
 * Custom React Hooks with Type Safety & Error Handling
 * Eliminates boilerplate and common pitfalls
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/types/safe-data";
import type { ApiResponse } from "@/types";

// ============ Use Mounted ============

/**
 * Track if component is mounted (prevents memory leaks)
 */
export function useMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
}

// ============ Use Safe State ============

/**
 * setState wrapper that only updates if component is mounted
 */
export function useSafeState<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState(initialValue);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((value: T) => {
    if (isMountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState];
}

// ============ Use Async ============

interface UseAsyncState<T, E> {
  status: "idle" | "pending" | "success" | "error";
  data: T | null;
  error: E | null;
  isLoading: boolean;
}

/**
 * Execute async function with proper error handling
 */
export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncState<T, E> & { execute: () => Promise<void> } {
  const [state, setState] = useSafeState<UseAsyncState<T, E>>({
    status: "idle",
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async () => {
    setState({ status: "pending", data: null, error: null, isLoading: true });

    try {
      const response = await asyncFunction();
      setState({
        status: "success",
        data: response,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      setState({
        status: "error",
        data: null,
        error: error as E,
        isLoading: false,
      });
      console.error("[useAsync] Error:", error);
    }
  }, [setState, asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

// ============ Use Debounce ============

/**
 * Debonce a value with configurable delay
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useSafeState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, setDebouncedValue]);

  return debouncedValue;
}

// ============ Use Throttle ============

/**
 * Throttle a callback function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRunRef = useRef<number>(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  ) as T;
}

// ============ Use Window Event ============

/**
 * Attach to window event with cleanup
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  handler: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  useEffect(() => {
    window.addEventListener(event, handler, options);
    return () => {
      window.removeEventListener(event, handler, options);
    };
  }, [event, handler, options]);
}

// ============ Use Local Storage ============

/**
 * Sync state with localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useSafeState<T>(() => {
    try {
      const storedItem = localStorage.getItem(key);
      return storedItem ? (JSON.parse(storedItem) as T) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Failed to read '${key}':`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`[useLocalStorage] Failed to write '${key}':`, error);
      }
    },
    [key, storedValue, setStoredValue]
  );

  return [storedValue, setValue];
}

// ============ Use Previous ============

/**
 * Get previous value of a variable
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============ Use Query with Error Handling ============

/**
 * Wrapper around useQuery with built-in error handling
 */
export function useSafeQuery<TData = unknown, TError = Error>(
  options: Parameters<typeof useQuery>[0] & {
    onErrorMessage?: (error: TError) => string;
  }
): UseQueryResult<TData, TError> & {
  errorMessage: string | null;
} {
  const result = useQuery(options);
  const errorMessage =
    result.error && options.onErrorMessage
      ? options.onErrorMessage(result.error)
      : result.error
        ? getErrorMessage(result.error)
        : null;

  return {
    ...result,
    errorMessage,
  };
}

// ============ Use Update Effect ============

/**
 * Like useEffect but skips first render
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
  }, deps);
}

// ============ Use Callback Ref ============

/**
 * Use a ref callback instead of ref object
 */
export function useCallbackRef<T>(
  callback: (el: T) => void
): (el: T | null) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((el: T | null) => {
    callbackRef.current?.(el);
  }, []);
}

// ============ Use Mutation with Error Handling ============

/**
 * Wrapper around useMutation with built-in error handling
 */
export function useSafeMutation<TData = unknown, TError = Error, TVariables = void>(
  options: Parameters<typeof useMutation>[0] & {
    onErrorMessage?: (error: TError) => string;
  }
) {
  const result = useMutation(options);

  const getErrorMessage = (error: TError): string => {
    if (options.onErrorMessage) {
      return options.onErrorMessage(error);
    }

    return error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as any).message)
        : "An error occurred";
  };

  return {
    ...result,
    getErrorMessage,
  };
}

// ============ Use Fetch ============

/**
 * Fetch data with proper error handling and TypeScript support
 */
export function useFetch<T = unknown>(
  url: string,
  options?: RequestInit & { refetchInterval?: number }
): UseAsyncState<T, Error> & {
  refetch: () => Promise<void>;
} {
  const [state, setState] = useSafeState<UseAsyncState<T, Error>>({
    status: "idle",
    data: null,
    error: null,
    isLoading: true,
  });

  const refetch = useCallback(async () => {
    setState({ status: "pending", data: null, error: null, isLoading: true });

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = (await response.json()) as T;

      setState({
        status: "success",
        data,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({
        status: "error",
        data: null,
        error: err,
        isLoading: false,
      });
      console.error("[useFetch] Error:", error);
    }
  }, [url, options, setState]);

  useEffect(() => {
    refetch();

    if (options?.refetchInterval) {
      const interval = setInterval(refetch, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [url, options?.refetchInterval, refetch]);

  return { ...state, refetch };
}
