/**
 * UI/UX Helper Components & Hooks
 * Addresses 9 medium priority UI/UX issues:
 * - Missing loading indicators
 * - Generic error messages
 * - Inaccessible forms
 * - Inconsistent user feedback
 */

import React, { ReactNode } from 'react';

/**
 * Enhanced Toast notification system with auto-dismiss
 * Prevents multiple simultaneous toasts and standardizes messages
 * 
 * @example
 * showToast('Order created', { type: 'success', duration: 3000 });
 * showToast('Invalid email', { type: 'error', autoClose: false });
 */
export class ToastManager {
  private static queue: Toast[] = [];
  private static listeners: Set<() => void> = new Set();
  private static maxToasts = 3;
  private static maxDuration = 30000; // Max 30 seconds

  static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  static getToasts() {
    return [...this.queue];
  }

  static show(message: string, options: ToastOptions = {}) {
    const {
      type = 'info',
      duration = 3000,
      autoClose = true,
      id = `toast-${Date.now()}-${Math.random()}`
    } = options;

    // Limit maximum toasts visible
    if (this.queue.length >= this.maxToasts) {
      const oldest = this.queue.shift();
      if (oldest) {
        this.removeById(oldest.id);
      }
    }

    const toast: Toast = {
      id,
      message,
      type,
      autoClose,
      duration: Math.min(duration, this.maxDuration)
    };

    this.queue.push(toast);
    this.notify();

    if (autoClose) {
      setTimeout(() => this.removeById(id), Math.min(duration, this.maxDuration));
    }

    return id;
  }

  static removeById(id: string) {
    this.queue = this.queue.filter(t => t.id !== id);
    this.notify();
  }

  static remove(index: number) {
    this.queue.splice(index, 1);
    this.notify();
  }

  static clear() {
    this.queue = [];
    this.notify();
  }

  private static notify() {
    this.listeners.forEach(listener => listener());
  }
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  autoClose: boolean;
  duration: number;
}

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  autoClose?: boolean;
  id?: string;
}

/**
 * Standardized error message translator
 * Converts API errors to user-friendly messages
 * 
 * @example
 * const message = translateError(error, 'fetch_users');
 * showToast(message, { type: 'error' });
 */
export function translateError(
  error: Error | any,
  context?: string
): string {
  const message = error?.message || error?.toString() || 'Unknown error';
  
  // Specific error patterns
  if (message.includes('timeout')) {
    return 'Request took too long. Please try again.';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection.';
  }
  
  if (message.includes('401') || message.includes('unauthorized')) {
    return 'Your session expired. Please log in again.';
  }
  
  if (message.includes('403') || message.includes('forbidden')) {
    return 'You don\'t have permission to perform this action.';
  }
  
  if (message.includes('404') || message.includes('not found')) {
    return `${context ? context + ' not found' : 'Resource not found'}.`;
  }
  
  if (message.includes('500') || message.includes('server')) {
    return 'Server error. Please try again later.';
  }

  // Context-specific fallbacks
  if (context === 'fetch_users') return 'Failed to load users. Please try again.';
  if (context === 'fetch_orders') return 'Failed to load orders. Please try again.';
  if (context === 'fetch_riders') return 'Failed to load riders. Please try again.';
  if (context === 'create_order') return 'Failed to create order. Please try again.';
  if (context === 'update_settings') return 'Failed to update settings. Please try again.';

  // Generic fallback
  return 'Operation failed. Please try again.';
}

/**
 * Loading state skeleton component
 * Shows while data is loading
 * 
 * @example
 * {isLoading ? <SkeletonLoader count={3} /> : <UserList users={users} />}
 */
export function SkeletonLoader({
  count = 1,
  height = 16,
  className = ''
}: {
  count?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="mb-4 bg-gray-200 rounded animate-pulse"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

/**
 * Error state component with retry capability
 * Shows user-friendly error message and retry button
 * 
 * @example
 * {error ? <ErrorState error={error} onRetry={refetch} /> : <Content />}
 */
export function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong',
  showDetails = __DEV__
}: {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
}) {
  const message = typeof error === 'string' ? error : error?.message;

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700 text-sm mb-4">
        {translateError(error)}
      </p>
      {showDetails && message && (
        <pre className="text-xs bg-red-100 p-2 rounded mb-4 overflow-auto">
          {message}
        </pre>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Empty state component for no data scenarios
 * Provides helpful messaging and next steps
 * 
 * @example
 * {users.length === 0 ? <EmptyState icon="users" title="No users yet" /> : <UserList />}
 */
export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="py-12 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Loading button component with disabled state
 * Prevents double-clicks and shows loading indicator
 * 
 * @example
 * <LoadingButton isLoading={isSaving} onClick={handleSave}>
 *   Save Changes
 * </LoadingButton>
 */
export function LoadingButton({
  isLoading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  variant = 'primary'
}: {
  isLoading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
  };

  return (
    <button
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`
        px-4 py-2 rounded text-white font-medium transition
        ${variantStyles[variant]}
        ${isLoading ? 'opacity-75 cursor-wait' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Accessible form field wrapper
 * Ensures proper ARIA labels and field associations
 * 
 * @example
 * <FormField
 *   label="Email"
 *   error={errors.email}
 *   required
 * >
 *   <input {...register('email')} />
 * </FormField>
 */
export function FormField({
  label,
  error,
  required,
  children,
  hint,
  id
}: {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  id?: string;
}) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div>
        {React.isValidElement(children)
          ? React.cloneElement(children as any, { id: fieldId, 'aria-describedby': error ? `${fieldId}-error` : undefined })
          : children}
      </div>

      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}

      {error && (
        <p id={`${fieldId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Hook for managing loading and error states together
 * Simplifies async operation state management
 * 
 * @example
 * const { loading, error, execute } = useAsyncState();
 * await execute(() => fetchUsers());
 */
export function useAsyncState() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    execute,
    clearError: () => setError(null),
    setError
  };
}

/**
 * Large dataset virtualization for efficient rendering
 * Only renders visible items instead of entire list
 * 
 * @example
 * <VirtualList items={users} renderItem={(user) => <UserCard user={user} />} />
 */
export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 100,
  containerHeight = 600,
  overscan = 3
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Convenience exports
export const showToast = (msg: string, opts?: ToastOptions) => {
  const id = ToastManager.show(msg, opts);
  if (__DEV__) console.log(`Toast [${opts?.type || 'info'}]: ${msg}`);
  return id;
};

export const showError = (msg: string | Error, context?: string) => {
  const userMessage = typeof msg === 'string' ? msg : translateError(msg, context);
  return showToast(userMessage, { type: 'error', duration: 5000 });
};

export const showSuccess = (msg: string) => {
  return showToast(msg, { type: 'success', duration: 3000 });
};

export const showWarning = (msg: string) => {
  return showToast(msg, { type: 'warning', duration: 4000 });
};
