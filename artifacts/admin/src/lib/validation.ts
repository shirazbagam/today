/**
 * Input Validation & Sanitization Utilities
 * Prevents XSS, SQL injection, and invalid data
 */

import DOMPurify from "dompurify";

// ============ String Sanitization ============

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string, options?: DOMPurify.Config): string {
  if (typeof input !== "string") return "";
  
  // Use DOMPurify to strip potentially dangerous HTML
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: [], // No HTML tags allowed in input
    ALLOWED_ATTR: [],
    ...options,
  };

  return DOMPurify.sanitize(input, config)
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize HTML content for display (preserve safe tags)
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return "";

  const config: DOMPurify.Config = {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "title"],
    KEEP_CONTENT: true,
  };

  return DOMPurify.sanitize(html, config);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (typeof text !== "string") return "";

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Trim and truncate string
 */
export function normalizeString(
  text: unknown,
  maxLength: number = 500,
  minLength: number = 0
): string {
  if (typeof text !== "string") return "";

  const trimmed = text.trim();
  if (trimmed.length < minLength) return "";
  if (trimmed.length > maxLength) return trimmed.slice(0, maxLength).trim();

  return trimmed;
}

// ============ Number Validation ============

/**
 * Validate and normalize price/amount inputs
 */
export function validateAmount(
  value: unknown,
  options?: {
    min?: number;
    max?: number;
    decimals?: number;
  }
): number | null {
  // Parse input
  let num: number;

  if (typeof value === "number") {
    num = value;
  } else if (typeof value === "string") {
    num = parseFloat(value);
  } else {
    return null;
  }

  // Check validity
  if (!Number.isFinite(num)) return null;
  if (num < 0) return null;

  // Apply constraints
  const { min = 0, max = Number.MAX_SAFE_INTEGER, decimals = 2 } = options || {};
  if (num < min || num > max) return null;

  // Round to decimals
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Validate quantity (must be positive integer)
 */
export function validateQuantity(value: unknown, max: number = 1000): number | null {
  const num = typeof value === "number" ? value : parseInt(String(value), 10);

  if (!Number.isInteger(num) || num <= 0 || num > max) {
    return null;
  }

  return num;
}

/**
 * Validate percentage (0-100)
 */
export function validatePercentage(value: unknown, decimals: number = 2): number | null {
  const amount = validateAmount(value, { min: 0, max: 100, decimals });
  return amount;
}

// ============ Date Validation ============

/**
 * Validate date string or object
 */
export function validateDate(value: unknown): Date | null {
  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string") {
    date = new Date(value);
  } else if (typeof value === "number") {
    date = new Date(value);
  } else {
    return null;
  }

  if (!Number.isFinite(date.getTime())) return null;
  return date;
}

/**
 * Validate that date is in future
 */
export function isFutureDate(value: unknown): boolean {
  const date = validateDate(value);
  return date !== null && date > new Date();
}

/**
 * Validate that date is in past
 */
export function isPastDate(value: unknown): boolean {
  const date = validateDate(value);
  return date !== null && date < new Date();
}

// ============ Contact Information ============

/**
 * Validate email address
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;

  const normalized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(normalized) && normalized.length <= 254;
}

/**
 * Validate phone number (international format)
 */
export function validatePhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false;

  const normalized = phone.replace(/\D/g, "");

  // Must be 7-15 digits (international standard)
  return normalized.length >= 7 && normalized.length <= 15;
}

/**
 * Normalize phone number (remove formatting)
 */
export function normalizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  return phone.replace(/\D/g, "");
}

// ============ Address & Location ============

/**
 * Validate latitude (-90 to 90)
 */
export function validateLatitude(lat: unknown): boolean {
  const num = typeof lat === "number" ? lat : parseFloat(String(lat));
  return Number.isFinite(num) && num >= -90 && num <= 90;
}

/**
 * Validate longitude (-180 to 180)
 */
export function validateLongitude(lng: unknown): boolean {
  const num = typeof lng === "number" ? lng : parseFloat(String(lng));
  return Number.isFinite(num) && num >= -180 && num <= 180;
}

/**
 * Validate geographic coordinates
 */
export function validateCoordinates(
  lat: unknown,
  lng: unknown
): { lat: number; lng: number } | null {
  if (!validateLatitude(lat) || !validateLongitude(lng)) return null;

  return {
    lat: lat as number,
    lng: lng as number,
  };
}

/**
 * Validate postal code (basic check)
 */
export function validatePostalCode(code: unknown): boolean {
  if (typeof code !== "string") return false;

  const normalized = code.trim().toUpperCase();
  // Allow alphanumeric with spaces/hyphens, 3-10 chars
  const postalCodeRegex = /^[A-Z0-9\s-]{3,10}$/;

  return postalCodeRegex.test(normalized);
}

// ============ Password & Security ============

/**
 * Validate password strength
 */
export function validatePassword(password: unknown): {
  valid: boolean;
  strength: "weak" | "medium" | "strong";
  errors: string[];
} {
  if (typeof password !== "string") {
    return { valid: false, strength: "weak", errors: ["Password must be a string"] };
  }

  const errors: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  } else if (password.length >= 12) {
    strength = "medium";
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain special character");
  } else if (errors.length === 0) {
    strength = "strong";
  }

  return {
    valid: errors.length === 0,
    strength,
    errors,
  };
}

/**
 * Validate TOTP token (6 digits)
 */
export function validateTOTPToken(token: unknown): boolean {
  if (typeof token !== "string") return false;

  const normalized = token.trim();
  return /^\d{6}$/.test(normalized);
}

// ============ Business Logic Validation ============

/**
 * Validate discount configuration
 */
export function validateDiscount(
  type: "percentage" | "fixed",
  value: unknown,
  options?: { maxValue?: number }
): boolean {
  const num = validateAmount(value, { max: options?.maxValue });
  
  if (num === null) return false;
  if (type === "percentage") return num >= 0 && num <= 100;
  if (type === "fixed") return num > 0;

  return false;
}

/**
 * Validate rating (1-5 stars)
 */
export function validateRating(rating: unknown): boolean {
  const num = typeof rating === "number" ? rating : parseFloat(String(rating));
  return Number.isFinite(num) && num >= 1 && num <= 5;
}

/**
 * Validate order status transition
 */
export function isValidOrderStatusTransition(
  currentStatus: string,
  nextStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    pending: ["accepted", "cancelled"],
    accepted: ["pickup", "cancelled"],
    pickup: ["delivery", "cancelled"],
    delivery: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  return (validTransitions[currentStatus] || []).includes(nextStatus);
}

// ============ Batch Validation ============

/**
 * Validate object against schema
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: unknown,
  schema: Record<keyof T, (val: unknown) => boolean>
): { valid: boolean; errors: Record<keyof T, string | null> } {
  const errors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
  let valid = true;

  if (typeof obj !== "object" || obj === null) {
    valid = false;
  } else {
    for (const [key, validator] of Object.entries(schema)) {
      const value = (obj as Record<string, unknown>)[key];
      const isValid = validator(value);
      errors[key as keyof T] = isValid ? null : `Invalid ${String(key)}`;
      if (!isValid) valid = false;
    }
  }

  return { valid, errors };
}

/**
 * Remove fields from object (whitelist)
 */
export function pickFields<T extends Record<string, unknown>>(
  obj: unknown,
  fields: (keyof T)[]
): Partial<T> {
  if (typeof obj !== "object" || obj === null) return {};

  const result: Partial<T> = {};
  const objRecord = obj as Record<string, unknown>;

  for (const field of fields) {
    if (field in objRecord) {
      result[field] = objRecord[field as string] as T[keyof T];
    }
  }

  return result;
}

/**
 * Remove sensitive fields from object
 */
export function removeSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  sensitiveFields: string[] = ["password", "token", "secret", "apiKey"]
): Partial<T> {
  const result: Partial<T> = { ...obj };

  for (const field of sensitiveFields) {
    delete result[field as keyof T];
  }

  return result;
}
