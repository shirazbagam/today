/**
 * Standardized API Service Patterns
 * Addresses 6 medium priority API integration issues:
 * - Inconsistent error handling across endpoints
 * - Missing response validation
 * - No retry logic
 * - Timeout issues
 * - Unhandled edge cases
 */

import {
  fetchWithTimeout,
  retryRequest,
  createRequestCache
} from './performance-utils';
import { translateError } from './ui-helpers';

/**
 * Standard API response envelope for consistency
 * All API endpoints should follow this pattern
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * API error class with standardized format
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: ApiResponse | any, statusCode: number): ApiError {
    if (response?.error) {
      return new ApiError(
        response.error.code || 'UNKNOWN_ERROR',
        statusCode,
        response.error.message || 'An error occurred',
        response.error.details
      );
    }

    const messageMap: Record<number, string> = {
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      429: 'Too many requests',
      500: 'Server error',
      503: 'Service unavailable'
    };

    return new ApiError(
      `HTTP_${statusCode}`,
      statusCode,
      messageMap[statusCode] || 'API request failed'
    );
  }
}

/**
 * Standardized API client with built-in error handling, retry logic, and timeouts
 * 
 * @example
 * const apiClient = new ApiClient({
 *   baseURL: 'http://api.example.com',
 *   timeout: 5000,
 *   retryAttempts: 3
 * });
 * 
 * const users = await apiClient.get<User[]>('/users', { cache: true });
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private requestCache: ReturnType<typeof createRequestCache>;
  private headers: Record<string, string>;
  private defaultRetryStatuses = [408, 429, 500, 502, 503, 504];

  constructor(options: {
    baseURL?: string;
    timeout?: number;
    retryAttempts?: number;
    headers?: Record<string, string>;
    cacheTTL?: number;
  } = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 10000;
    this.retryAttempts = options.retryAttempts || 2;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    this.requestCache = createRequestCache(options.cacheTTL || 5 * 60 * 1000);
  }

  /**
   * Perform GET request with optional caching
   */
  async get<T = any>(
    path: string,
    options: {
      cache?: boolean;
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { cache = false, params, headers } = options;
    const url = this.buildURL(path, params);

    if (cache) {
      return this.requestCache.get(url, () =>
        this.request<T>('GET', url, undefined, headers)
      );
    }

    return this.request<T>('GET', url, undefined, headers);
  }

  /**
   * Perform POST request with request body
   */
  async post<T = any>(
    path: string,
    data?: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<T> {
    return this.request<T>('POST', this.buildURL(path), data, options.headers);
  }

  /**
   * Perform PATCH request with partial data
   */
  async patch<T = any>(
    path: string,
    data?: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<T> {
    return this.request<T>('PATCH', this.buildURL(path), data, options.headers);
  }

  /**
   * Perform PUT request with full data
   */
  async put<T = any>(
    path: string,
    data?: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<T> {
    return this.request<T>('PUT', this.buildURL(path), data, options.headers);
  }

  /**
   * Perform DELETE request
   */
  async delete<T = any>(
    path: string,
    options: { headers?: Record<string, string> } = {}
  ): Promise<T> {
    return this.request<T>('DELETE', this.buildURL(path), undefined, options.headers);
  }

  /**
   * Low-level request method with retry and timeout logic
   */
  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const finalHeaders = { ...this.headers, ...headers };

    const makeFetch = async () => {
      const response = await fetchWithTimeout(url, {
        method,
        headers: finalHeaders,
        body: data ? JSON.stringify(data) : undefined,
        timeout: this.timeout
      });

      return this.handleResponse<T>(response);
    };

    try {
      return await retryRequest(makeFetch, {
        maxRetries: this.retryAttempts,
        initialDelay: 1000,
        maxDelay: 5000
      });
    } catch (err) {
      if (__DEV__) {
        console.error(`API Error [${method} ${url}]:`, err);
      }
      throw err;
    }
  }

  /**
   * Handle API response with standardized error handling
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let body;

    try {
      if (contentType?.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }
    } catch (err) {
      throw new ApiError(
        'PARSE_ERROR',
        response.status,
        'Failed to parse response',
        { error: String(err) }
      );
    }

    // Check for API error envelope
    if (typeof body === 'object' && body !== null && !body.success) {
      throw ApiError.fromResponse(body, response.status);
    }

    // Check HTTP status
    if (!response.ok) {
      throw ApiError.fromResponse(body, response.status);
    }

    // Extract data from envelope or return body directly
    return typeof body === 'object' && body?.data !== undefined
      ? body.data as T
      : (body as T);
  }

  /**
   * Set request header for all subsequent requests
   */
  setHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  /**
   * Clear all cached requests
   */
  clearCache() {
    this.requestCache.clear();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidateCache(path: string, params?: Record<string, any>) {
    const url = this.buildURL(path, params);
    this.requestCache.invalidate(url);
  }

  /**
   * Helper to build full URL with query params
   */
  private buildURL(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }
}

/**
 * Response validator helper
 * Ensures API responses match expected schema
 * 
 * @example
 * const validateUser = createValidator<User>({
 *   id: 'string',
 *   email: 'string',
 *   name: 'string'
 * });
 * 
 * const user = await validateResponse(apiCall(), validateUser);
 */
export function createValidator<T>(schema: Record<string, string>) {
  return (data: any): data is T => {
    if (!data || typeof data !== 'object') return false;

    for (const [key, type] of Object.entries(schema)) {
      if (type === 'string' && typeof data[key] !== 'string') return false;
      if (type === 'number' && typeof data[key] !== 'number') return false;
      if (type === 'boolean' && typeof data[key] !== 'boolean') return false;
      if (type === 'array' && !Array.isArray(data[key])) return false;
      if (type === 'object' && (typeof data[key] !== 'object' || Array.isArray(data[key]))) return false;
    }

    return true;
  };
}

/**
 * Validates entire API response
 */
export async function validateResponse<T>(
  promise: Promise<any>,
  validator: (data: any) => data is T
): Promise<T> {
  const data = await promise;

  if (!validator(data)) {
    throw new ApiError(
      'INVALID_RESPONSE',
      500,
      'API response does not match expected schema',
      { received: data }
    );
  }

  return data;
}

/**
 * Standardized API error handler for React components
 * Provides consistent error logging and user feedback
 * 
 * @example
 * try {
 *   await fetchOrders();
 * } catch (err) {
 *   const message = handleApiError(err, 'fetch_orders');
 *   showToast(message, { type: 'error' });
 * }
 */
export function handleApiError(
  error: unknown,
  context?: string
): string {
  if (error instanceof ApiError) {
    if (__DEV__) {
      console.error(`API Error [${error.code}]:`, error.message, error.details);
    }
    return translateError(error, context);
  }

  if (error instanceof Error) {
    if (__DEV__) {
      console.error(`Error [${context}]:`, error.message);
    }
    return translateError(error, context);
  }

  const message = String(error);
  if (__DEV__) {
    console.error(`Unknown error [${context}]:`, message);
  }
  return translateError(new Error(message), context);
}

/**
 * Batch API responses for consistency
 * Example: fetch multiple resources at once
 * 
 * @example
 * const [users, orders, stats] = await batchRequests(
 *   () => apiClient.get('/users'),
 *   () => apiClient.get('/orders'),
 *   () => apiClient.get('/stats')
 * );
 */
export async function batchRequests<T extends readonly (() => Promise<any>)[]>(
  ...requests: T
): Promise<{ -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results = await Promise.all(requests.map(req => {
    return req().catch(err => ({ _error: err }));
  }));

  // Check for errors and throw with all error details
  const errors = results
    .map((r, i) => (r?._error ? `Request ${i}: ${String(r._error)}` : null))
    .filter(Boolean);

  if (errors.length > 0) {
    throw new ApiError(
      'BATCH_REQUEST_FAILED',
      500,
      'One or more requests failed',
      { errors }
    );
  }

  return results as any;
}

/**
 * Create a specific API service for a resource
 * Reduces boilerplate for common CRUD operations
 * 
 * @example
 * const usersService = createApiService<User>('/users', apiClient);
 * await usersService.list({ page: 1, limit: 10 });
 * await usersService.get('user-1');
 * await usersService.create({ name: 'John' });
 */
export function createApiService<T extends { id?: string }>(
  basePath: string,
  client: ApiClient
) {
  return {
    list: async (params?: Record<string, any>) =>
      client.get<T[]>(basePath, { params, cache: true }),

    get: async (id: string, useCache = true) =>
      client.get<T>(`${basePath}/${id}`, { cache: useCache }),

    create: async (data: Omit<T, 'id'>) =>
      client.post<T>(basePath, data),

    update: async (id: string, data: Partial<T>) =>
      client.patch<T>(`${basePath}/${id}`, data),

    replace: async (id: string, data: T) =>
      client.put<T>(`${basePath}/${id}`, data),

    delete: async (id: string) =>
      client.delete(`${basePath}/${id}`),

    invalidateCache: () => client.invalidateCache(basePath),

    search: async (query: string, params?: Record<string, any>) =>
      client.get<T[]>(`${basePath}/search`, {
        params: { q: query, ...params },
        cache: true
      })
  };
}

// Default client instance
let defaultClient: ApiClient | null = null;

export function getDefaultClient(): ApiClient {
  if (!defaultClient) {
    defaultClient = new ApiClient({
      baseURL: typeof globalThis !== 'undefined' ? '' : 'http://localhost:3000/api',
      timeout: 10000,
      retryAttempts: 2
    });
  }
  return defaultClient;
}

export function setDefaultClient(client: ApiClient) {
  defaultClient = client;
}
