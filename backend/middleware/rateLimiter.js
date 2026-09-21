/**
 * Rate-limiting middleware (Practical 5 – Secure REST APIs)
 *
 * Two limiters are exported:
 *
 *   generalLimiter  — applied to the whole /api/* namespace.
 *                     Prevents API abuse while leaving plenty of room
 *                     for normal development / testing usage.
 *
 *   authLimiter     — applied only to the three auth POST endpoints
 *                     (register / login / google).  Brute-force or
 *                     credential-stuffing attacks against these routes
 *                     are the highest-impact risk, so the window is
 *                     shorter and the cap is lower.
 *
 * Limits are read from environment variables so they can be tightened
 * for staging/production without a code change.
 */
import rateLimit from 'express-rate-limit'

// ── helpers ──────────────────────────────────────────────────────────────────

function envInt(name, fallback) {
  const val = parseInt(process.env[name], 10)
  return Number.isFinite(val) ? val : fallback
}

// Shared handler so both limiters return the same JSON shape as every
// other Examora error response.
function onLimitReached(req, res /*next, options*/) {
  res.status(429).json({
    success: false,
    message: 'Too many requests — please slow down and try again shortly.',
  })
}

// ── General API limiter ───────────────────────────────────────────────────────
// Default: 200 requests per 15-minute window per IP.
// Override via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX.

export const generalLimiter = rateLimit({
  windowMs: envInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 min
  max: envInt('RATE_LIMIT_MAX', 200),
  standardHeaders: true,   // send RateLimit-* headers (RFC 6585 draft-7)
  legacyHeaders: false,    // suppress X-RateLimit-* headers (deprecated)
  handler: onLimitReached,
})

// ── Auth-endpoint limiter ─────────────────────────────────────────────────────
// Default: 20 requests per 15-minute window per IP.
// Override via AUTH_RATE_LIMIT_WINDOW_MS and AUTH_RATE_LIMIT_MAX.

export const authLimiter = rateLimit({
  windowMs: envInt('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 min
  max: envInt('AUTH_RATE_LIMIT_MAX', 20),
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached,
})
