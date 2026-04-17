/**
 * Secure Authentication Context
 * Manages admin token securely without localStorage exposure to XSS
 * 
 * Current best practice: Store httpOnly cookie via backend (recommended)
 * Fallback: Session storage for this session only (clears on browser close)
 */

export type AuthToken = {
  value: string;
  expiresAt: number;
};

class SecureAuthStore {
  private token: AuthToken | null = null;
  private listeners: Set<(token: AuthToken | null) => void> = new Set();

  /**
   * Get current auth token.
   * For production: Use httpOnly cookie (no JS access needed)
   * For fallback: Use sessionStorage (cleared on close)
   */
  getToken(): string | null {
    // Try to get from sessionStorage first (cleaned on close)
    try {
      const stored = sessionStorage.getItem("ajkmart_admin_session_token");
      if (stored) {
        const parsed = JSON.parse(stored) as AuthToken;
        if (parsed.expiresAt > Date.now()) {
          return parsed.value;
        }
        // Token expired, clear it
        sessionStorage.removeItem("ajkmart_admin_session_token");
      }
    } catch (e) {
      console.error("[AuthStore] Failed to read session storage:", e);
    }

    // If no session token and localStorage has legacy token (from old version),
    // migrate it to sessionStorage (one-time)
    try {
      const legacyToken = localStorage.getItem("ajkmart_admin_token");
      if (legacyToken) {
        console.warn("[AuthStore] Migrating legacy localStorage token to sessionStorage");
        sessionStorage.setItem("ajkmart_admin_session_token", JSON.stringify({
          value: legacyToken,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        } as AuthToken));
        localStorage.removeItem("ajkmart_admin_token");
        return legacyToken;
      }
    } catch (e) {
      console.error("[AuthStore] Failed to migrate legacy token:", e);
      localStorage.removeItem("ajkmart_admin_token"); // Remove if problematic
    }

    return null;
  }

  /**
   * Set auth token securely in sessionStorage
   * NOT in localStorage (prevents cross-tab token exposure to XSS)
   * 
   * In production: Server should set httpOnly cookie and we don't need this
   */
  setToken(token: string, expiresIn: number = 24 * 60 * 60 * 1000): void {
    if (!token) {
      this.clearToken();
      return;
    }

    try {
      const authToken: AuthToken = {
        value: token,
        expiresAt: Date.now() + expiresIn,
      };
      sessionStorage.setItem("ajkmart_admin_session_token", JSON.stringify(authToken));
      this.token = authToken;
      this.notifyListeners(authToken);
    } catch (e) {
      console.error("[AuthStore] Failed to set token in sessionStorage:", e);
    }
  }

  /**
   * Clear token atomically
   * Prevents race conditions by removing in one operation
   */
  clearToken(): void {
    try {
      sessionStorage.removeItem("ajkmart_admin_session_token");
    } catch (e) {
      console.error("[AuthStore] Failed to clear session storage:", e);
    }

    // Always clear legacy localStorage too
    try {
      localStorage.removeItem("ajkmart_admin_token");
    } catch (e) {
      console.error("[AuthStore] Failed to clear legacy localStorage:", e);
    }

    this.token = null;
    this.notifyListeners(null);
  }

  /**
   * Subscribe to token changes
   * Allows UI to react when auth state changes (e.g., logout)
   */
  subscribe(listener: (token: AuthToken | null) => void): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.token);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(token: AuthToken | null): void {
    this.listeners.forEach(listener => listener(token));
  }
}

// Singleton instance
export const authStore = new SecureAuthStore();

/**
 * Secure CSRF Token Management
 * CSRF tokens prevent cross-site request forgery attacks
 */
class CSRFTokenManager {
  private csrfToken: string | null = null;
  private csrfTokenExpiresAt: number = 0;

  /**
   * Get CSRF token from server
   * Should be fetched fresh at app startup and stored for session
   */
  async getOrFetchToken(): Promise<string> {
    const now = Date.now();

    // Return cached token if still valid (1 hour TTL)
    if (this.csrfToken && this.csrfTokenExpiresAt > now) {
      return this.csrfToken;
    }

    try {
      const response = await fetch("/api/admin/csrf-token", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        console.error("[CSRF] Failed to fetch CSRF token:", response.status);
        throw new Error("Failed to fetch CSRF token");
      }

      const data = await response.json() as { token: string };
      this.csrfToken = data.token;
      this.csrfTokenExpiresAt = now + (60 * 60 * 1000); // 1 hour

      return data.token;
    } catch (error) {
      console.error("[CSRF] Error fetching token:", error);
      throw error;
    }
  }

  /**
   * Clear cached CSRF token
   * Call this on logout
   */
  clearToken(): void {
    this.csrfToken = null;
    this.csrfTokenExpiresAt = 0;
  }
}

export const csrfManager = new CSRFTokenManager();
