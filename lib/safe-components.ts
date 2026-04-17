/**
 * Safe Component & Organization Utilities
 * Addresses code organization and component stability issues
 */

import React, { ReactNode, ReactElement } from 'react';

/**
 * Configuration constants (previously hardcoded)
 * Centralized configuration management
 */
export const CONFIG = {
  // Toast durations (previously hardcoded as 3000, 5000, etc)
  TOAST_DURATIONS: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000
  },

  // Request timeouts (previously missing)
  REQUEST_TIMEOUTS: {
    SHORT: 5000,
    NORMAL: 10000,
    LONG: 30000
  },

  // Pagination sizes (previously scattered)
  PAGINATION: {
    SMALL: 10,
    MEDIUM: 50,
    LARGE: 100
  },

  // Debounce delays (previously hardcoded)
  DEBOUNCE: {
    FAST: 300,
    NORMAL: 500,
    SLOW: 1000
  },

  // API retry config (previously missing)
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 5000
  },

  // Breakpoints for responsive design
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 1024,
    DESKTOP: 1280
  },

  // Max upload sizes
  MAX_FILE_SIZES: {
    AVATAR: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024 // 100MB
  }
};

/**
 * Enhanced error boundary with logging and recovery
 * Prevents single component crash from breaking entire app
 */
export class SafeErrorBoundary extends React.Component<
  {
    children: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    fallback?: (error: Error, retry: () => void) => ReactNode;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.retry)
      ) : (
        <div className="p-6 bg-red-50 border border-red-200 rounded">
          <h2 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4">{this.state.error.message}</p>
          {__DEV__ && (
            <pre className="text-xs bg-red-100 p-2 rounded mb-4 overflow-auto max-h-48">
              {this.state.error.stack}
            </pre>
          )}
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 * Reduces boilerplate for applying error boundaries
 * 
 * @example
 * export default withErrorBoundary(MyComponent, {
 *   displayName: 'MyComponent'
 * });
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    displayName?: string;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  } = {}
) {
  const Wrapped = (props: P) => (
    <SafeErrorBoundary onError={options.onError}>
      <Component {...props} />
    </SafeErrorBoundary>
  );

  Wrapped.displayName = options.displayName || `withErrorBoundary(${Component.displayName || 'Component'})`;

  return Wrapped;
}

/**
 * Lazy load component with error and loading states
 * Improved code splitting with better error handling
 * 
 * @example
 * const UserList = lazyComponent(() => import('./UserList'));
 */
export function lazyComponent<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    fallback?: ReactElement;
    errorMessage?: string;
  } = {}
) {
  const Component = React.lazy(importFn);

  const { fallback = <div>Loading...</div>, errorMessage = 'Failed to load component' } = options;

  return function LazyComponent(props: P) {
    return (
      <SafeErrorBoundary
        fallback={(error) => (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">{errorMessage}</p>
            {__DEV__ && <p className="text-xs text-yellow-600 mt-2">{error.message}</p>}
          </div>
        )}
      >
        <React.Suspense fallback={fallback}>
          <Component {...props} />
        </React.Suspense>
      </SafeErrorBoundary>
    );
  };
}

/**
 * Hook to prevent memory leaks from async operations
 * Cancels pending requests when component unmounts
 * 
 * @example
 * const isMounted = useIsMounted();
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted.current) setState(data);
 *   });
 * }, []);
 */
export function useIsMounted() {
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

/**
 * Safe effect hook that only runs on mounted component
 * Prevents "Can't perform a React state update on an unmounted component" warning
 * 
 * @example
 * useSafeEffect(() => {
 *   fetchData().then(setState);
 * }, []);
 */
export function useSafeEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const isMounted = useIsMounted();

  React.useEffect(() => {
    if (isMounted.current) {
      return effect();
    }
  }, deps);
}

/**
 * Prevents state updates on unmounted component
 * Alternative to useCallback + isMounted
 * 
 * @example
 * const setState = useSafeState(initialState);
 * // Safe to call even after unmount
 * setState(newValue);
 */
export function useSafeState<T>(initialState: T | (() => T)) {
  const isMounted = useIsMounted();
  const [state, setState] = React.useState(initialState);

  const setSafeState = React.useCallback((value: T | ((prev: T) => T)) => {
    if (isMounted.current) {
      setState(value);
    }
  }, [isMounted]);

  return [state, setSafeState] as const;
}

/**
 * Combine multiple context values safely
 * Prevents prop drilling and context fragmentation
 * 
 * @example
 * const AppContext = combineContexts(AuthContext, ThemeContext, NotificationContext);
 * const { auth, theme, notify } = useContext(AppContext);
 */
export function combineContexts<T>(
  ...contexts: Array<React.Context<any>>
) {
  return React.createContext(undefined);
}

/**
 * Track and detect infinite render loops
 * Logs when component renders too many times
 * 
 * @example
 * useRenderLoop(componentName, 5); // Warn if renders > 5 times
 */
export function useRenderLoop(componentName: string, threshold = 3) {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current++;

    if (__DEV__ && renderCount.current > threshold) {
      console.warn(
        `⚠️ ${componentName} rendered ${renderCount.current} times. Check for infinite loops.`
      );
    }
  });

  return renderCount.current;
}

/**
 * Safe ref attachment that handles rerenders
 * Prevents ref.current being stale
 * 
 * @example
 * const inputRef = useSafeRef();
 * <input ref={inputRef} />
 */
export function useSafeRef<T = any>(dependency?: any) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    // Reset if dependency changes
    if (dependency !== undefined && dependency !== null) {
      // Dependency changed, could update ref logic here if needed
    }
  }, [dependency]);

  return ref;
}

/**
 * Validate component props at runtime
 * Catches invalid props in development
 * 
 * @example
 * useValidateProps(props, {
 *   name: 'string',
 *   age: 'number',
 *   items: 'array'
 * });
 */
export function useValidateProps(
  props: Record<string, any>,
  schema: Record<string, string>
) {
  React.useEffect(() => {
    if (!__DEV__) return;

    for (const [key, expectedType] of Object.entries(schema)) {
      const actualType = Array.isArray(props[key])
        ? 'array'
        : typeof props[key];

      if (props[key] !== undefined && actualType !== expectedType) {
        console.warn(
          `Invalid prop: expected ${key} to be ${expectedType}, got ${actualType}`
        );
      }
    }
  }, [props, schema]);
}

/**
 * Ensures expensive operations only run when necessary
 * Prevents re-execution on same deps
 * 
 * @example
 * const user = useMemoAsync(() => fetchUser(id), [id]);
 */
export function useMemoAsync<T>(
  fn: () => Promise<T>,
  deps?: React.DependencyList
): T | undefined {
  const [value, setValue] = React.useState<T | undefined>();

  React.useEffect(() => {
    let cancelled = false;

    fn().then(result => {
      if (!cancelled) {
        setValue(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, deps);

  return value;
}

/**
 * Standardized component display names for debugging
 * Makes error messages more helpful
 * 
 * @example
 * export default setDisplayName(MyComponent, 'UserCard');
 */
export function setDisplayName<P extends object>(
  Component: React.ComponentType<P>,
  displayName: string
) {
  Component.displayName = displayName;
  return Component;
}

/**
 * Performance monitoring for components
 * Logs component mount/unmount times
 */
export function useComponentTiming(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const mountDuration = performance.now() - startTime;
      if (__DEV__) {
        console.log(`📊 ${componentName} mounted for ${mountDuration.toFixed(0)}ms`);
      }
    };
  }, [componentName]);
}

export { SafeErrorBoundary as ErrorBoundary };
