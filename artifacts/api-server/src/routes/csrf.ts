import { Router as ExpressRouter } from "express";
import { validateCSRFToken, generateCSRFToken } from "../middleware/csrf";
import { requireAdminToken } from "../middleware/auth";

export const csrfRouter = ExpressRouter();

/**
 * GET /api/admin/csrf-token
 * Fetch a fresh CSRF token for state-changing requests
 * 
 * Security:
 * - Token generated server-side with cryptographic randomness
 * - Stored in session (server-side memory or Redis)
 * - Client includes token in X-CSRF-Token header
 * - All POST/PUT/DELETE/PATCH requests validated
 * 
 * Response:
 * {
 *   "token": "eyJhbGciOiJIR... (HS256 signed JWT with 1-hour TTL)",
 *   "expiresIn": 3600
 * }
 */
csrfRouter.get("/csrf-token", (req, res) => {
  try {
    const token = generateCSRFToken(req.sessionID || req.ip || "anonymous");
    res.json({
      token,
      expiresIn: 3600, // 1 hour
      headers: {
        "X-CSRF-Token": token,
      }
    });
  } catch (error) {
    console.error("[CSRF] Failed to generate token:", error);
    res.status(500).json({ error: "Failed to generate CSRF token" });
  }
});

/**
 * Middleware to validate CSRF tokens on state-changing operations
 * 
 * Usage:
 * app.post("/api/admin/something", validateCSRFToken, (req, res) => { ... });
 */
export const csrfMiddleware = (req, res, next) => {
  // CSRF only needed for state-changing methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const token = req.headers["x-csrf-token"] || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({
      error: "Missing CSRF token",
      details: "X-CSRF-Token header required for state-changing requests"
    });
  }

  if (!validateCSRFToken(token, req.sessionID || req.ip || "anonymous")) {
    return res.status(403).json({
      error: "Invalid CSRF token",
      details: "Request rejected - invalid or expired CSRF token"
    });
  }

  next();
};

export default csrfRouter;
