/**
 * Type Guards & Safe Data Access Utilities
 * Eliminate null/undefined errors and replace `any` types
 */

import type {
  Rider, RiderLocation, RiderPenalty, RiderStatus,
  Order, User, SosAlert, Notification,
  DashboardStats, PromoCode, BroadcastMessage,
  LoginResponse, ErrorResponse, ApiResponse
} from "./index";

// ============ Type Guards ============

export function isRider(data: unknown): data is Rider {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.userId === "string" &&
    typeof obj.name === "string" &&
    typeof obj.isOnline === "boolean" &&
    typeof obj.lat === "number" &&
    typeof obj.lng === "number"
  );
}

export function isRiderArray(data: unknown): data is Rider[] {
  return Array.isArray(data) && data.every(isRider);
}

export function isOrder(data: unknown): data is Order {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.customerId === "string" &&
    typeof obj.total === "number"
  );
}

export function isUser(data: unknown): data is User {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string"
  );
}

export function isSosAlert(data: unknown): data is SosAlert {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.sosStatus === "string"
  );
}

export function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return "success" in obj || "data" in obj || "error" in obj;
}

// ============ Safe Data Access ============

/**
 * Safely get a value from an object with default fallback
 */
export function safeGet<T>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || typeof obj !== "object") return defaultValue;

  const keys = path.split(".");
  let current: any = obj;

  for (const key of keys) {
    if (current?.[key] === undefined || current?.[key] === null) {
      return defaultValue;
    }
    current = current[key];
  }

  return current as T;
}

/**
 * Safely get an array, returning empty array if null/undefined/not-array
 */
export function safeArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return [];
}

/**
 * Safely get an object, returning empty object if null/undefined
 */
export function safeObject<T extends Record<string, unknown>>(
  data: unknown
): T {
  if (typeof data === "object" && data !== null) {
    return data as T;
  }
  return {} as T;
}

/**
 * Safely get a string with minimum length requirement
 */
export function safeString(value: unknown, minLength: number = 0): string {
  if (typeof value === "string" && value.length >= minLength) {
    return value;
  }
  return "";
}

/**
 * Safely get a number with optional min/max bounds
 */
export function safeNumber(
  value: unknown,
  min?: number,
  max?: number
): number | null {
  if (typeof value !== "number") return null;
  if (Number.isNaN(value)) return null;
  if (min !== undefined && value < min) return null;
  if (max !== undefined && value > max) return null;
  return value;
}

/**
 * Safely get a boolean
 */
export function safeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return defaultValue;
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T = unknown>(json: unknown, defaultValue?: T): T | undefined {
  if (typeof json !== "string") return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    console.error("[SafeJSON] Failed to parse:", json);
    return defaultValue;
  }
}

// ============ Data Transformation with Type Safety ============

/**
 * Extract document URLs from user data safely
 */
export function extractDocuments(data: unknown) {
  const result = {
    files: [] as Array<{ type: string; url: string; label: string }>,
    error: null as string | null,
  };

  if (!data || typeof data !== "object") return result;

  const kyc = safeGet<Record<string, unknown>>(data, "kyc.documents");
  if (!kyc || !Array.isArray(kyc)) return result;

  try {
    for (const doc of kyc) {
      if (typeof doc === "object" && doc !== null) {
        const docObj = doc as any;
        if (docObj.url && typeof docObj.url === "string") {
          result.files.push({
            type: safeString(docObj.type),
            url: docObj.url,
            label: safeString(docObj.label),
          });
        }
      }
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Failed to parse documents";
    console.error("[ExtractDocuments] Error:", error);
  }

  return result;
}

/**
 * Safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errorObj = error as any;
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
    if (typeof errorObj.error === "string") {
      return errorObj.error;
    }
    if (typeof errorObj.description === "string") {
      return errorObj.description;
    }
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Safe stats extraction with defaults
 */
export function extractStats(data: unknown): DashboardStats {
  const safeData = safeObject<any>(data);
  
  return {
    totalUsers: safeNumber(safeData.totalUsers, 0) ?? 0,
    activeRiders: safeNumber(safeData.activeRiders, 0) ?? 0,
    totalOrders: safeNumber(safeData.totalOrders, 0) ?? 0,
    totalRevenue: safeNumber(safeData.totalRevenue, 0) ?? 0,
    totalDistance: safeNumber(safeData.totalDistance, 0) ?? 0,
    averageRating: safeNumber(safeData.averageRating, 0, 5) ?? 0,
    topCities: safeArray(safeData.topCities),
    topProducts: safeArray(safeData.topProducts),
  };
}

// ============ Validation Utilities ============

/**
 * Validate email format
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (international)
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false;
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Validate latitude/longitude
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  const latNum = safeNumber(lat);
  const lngNum = safeNumber(lng);
  return (
    latNum !== null &&
    lngNum !== null &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
}

/**
 * Validate amount (price, discount, etc.)
 */
export function isValidAmount(amount: unknown): boolean {
  const num = safeNumber(amount);
  return num !== null && num >= 0;
}

// ============ Array Operations with Type Safety ============

/**
 * Deduplicate array by field
 */
export function deduplicateBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): T[] {
  const seen = new Set();
  const result: T[] = [];

  for (const item of arr) {
    const value = item[key];
    if (!seen.has(value)) {
      seen.add(value);
      result.push(item);
    }
  }

  return result;
}

/**
 * Group array by field
 */
export function groupBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Safe array filter with type predicate
 */
export function filterByType<T extends Record<string, unknown>>(
  arr: unknown[],
  key: string,
  value: unknown
): T[] {
  if (!Array.isArray(arr)) return [];

  return arr
    .filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return obj[key] === value;
    })
    .map((item) => item as T);
}
