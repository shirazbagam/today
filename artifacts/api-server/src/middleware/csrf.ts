import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * CSRF Token Management
 * 
 * Tokens are JWT-signed to prevent tampering
 * Includes:
 * - sessionId (to bind token to session)
 * - issuedAt timestamp
 * - expiration (1 hour)
 * - random nonce for uniqueness
 */

const CSRF_SECRET = process.env.CSRF_SECRET || "change-this-in-production";
const CSRF_EXPIRY = "1h"; // 1 hour

interface CSRFPayload {
  sessionId: string;
  nonce: string;
  iat: number;
}

/**
 * Generate a CSRF token for the given session
 * Token is cryptographically secure and signed with JWT
 * 
 * @param sessionId Session identifier (session ID, user IP, or similar)
 * @returns JWT-signed CSRF token
 */
export function generateCSRFToken(sessionId: string): string {
  const nonce = crypto.randomBytes(24).toString("hex");
  
  const payload: CSRFPayload = {
    sessionId,
    nonce,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, CSRF_SECRET, {
    expiresIn: CSRF_EXPIRY,
    algorithm: "HS256",
  });

  console.log(`[CSRF] Generated token for session ${sessionId.substring(0, 8)}...`);
  return token;
}

/**
 * Validate a CSRF token
 * Checks JWT signature and verifies session binding
 * 
 * @param token The CSRF token from request
 * @param sessionId Session identifier to verify against
 * @returns true if valid, false otherwise
 */
export function validateCSRFToken(token: string, sessionId: string): boolean {
  try {
    const decoded = jwt.verify(token, CSRF_SECRET, {
      algorithms: ["HS256"],
    }) as CSRFPayload;

    // Verify session binding
    if (decoded.sessionId !== sessionId) {
      console.warn("[CSRF] Session ID mismatch - possible CSRF attack");
      return false;
    }

    console.log(`[CSRF] Valid token for session ${sessionId.substring(0, 8)}...`);
    return true;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn(`[CSRF] Token expired: ${error.message}`);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn(`[CSRF] Invalid token: ${error.message}`);
    } else {
      console.error("[CSRF] Verification error:", error);
    }
    return false;
  }
}

/**
 * Clear CSRF session (on logout)
 * In a production app with Redis session store, this would delete the CSRF token from Redis
 * 
 * @param sessionId Session to clear
 */
export function clearCSRFToken(sessionId: string): void {
  console.log(`[CSRF] Cleared token for session ${sessionId.substring(0, 8)}...`);
  // In production with Redis: await redis.del(`csrf:${sessionId}`);
}
