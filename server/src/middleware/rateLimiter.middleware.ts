import rateLimit from "express-rate-limit";

// Strict limiter for authentication endpoints (brute-force protection)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication attempts. Please try again in 15 minutes.",
    },
  },
});

// Strict limiter for public lead capture endpoints (spam protection)
export const publicLeadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 submissions per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many inquiry submissions from this IP. Please try again later.",
    },
  },
});

// Re-export tenant-aware limiter from tenant.middleware for unified access
export { tenantApiRateLimiter } from "./tenant.middleware.js";
