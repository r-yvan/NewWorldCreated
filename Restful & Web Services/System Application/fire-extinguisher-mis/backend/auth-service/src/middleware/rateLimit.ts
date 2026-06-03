import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    errors: [],
  },
});

// Stricter limiter for sensitive auth endpoints (login/register).
// Uses request body email to track attempts per user, not just per IP
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  // Use email from request body if available, otherwise fall back to IP
  keyGenerator: (req) => {
    const email = req.body?.email;
    return email ? `email:${email}` : req.ip || 'unknown';
  },
  // Skip failed requests from counting against limit (only count successful attempts)
  skipFailedRequests: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
    errors: [],
  },
});
