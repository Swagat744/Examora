/**
 * Examora – Express application entry point
 *
 * Security layers applied here (Practical 5 – Secure REST APIs):
 *
 *  1. Helmet       — sets secure HTTP response headers (X-Content-Type-Options,
 *                    X-Frame-Options, X-XSS-Protection, Strict-Transport-Security,
 *                    etc.) to harden the API against common web vulnerabilities.
 *                    Content-Security-Policy is disabled because this is a REST
 *                    API that returns JSON, not HTML pages — CSP has no meaning
 *                    here and would add unnecessary complexity.
 *
 *  2. CORS         — restricts origins to the configured frontend URL
 *                    (CLIENT_ORIGIN env var, defaults to localhost:5173).
 *                    credentials: true is set so the frontend's Fetch calls
 *                    with Authorization headers are not blocked.
 *
 *  3. Body limit   — express.json({ limit: '10kb' }) prevents oversized
 *                    JSON payloads from reaching controllers.
 *
 *  4. Rate limits  — generalLimiter on all /api/* routes, stricter
 *                    authLimiter on /api/auth routes.  Both are
 *                    configurable via environment variables.
 *
 * Everything else (JWT auth, RBAC, input validation, error handling)
 * is applied at the route / middleware layer.
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

// Reload environment variables on nodemon restart

import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import examRoutes from './routes/examRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { generalLimiter } from './middleware/rateLimiter.js'

dotenv.config()

// ── Required environment variable check ──────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Check your .env file.')
  process.exit(1)
}

const app = express()

// ── Security headers (Helmet) ─────────────────────────────────────────────────
// contentSecurityPolicy is disabled — this server returns JSON, not HTML.
// crossOriginEmbedderPolicy is disabled to avoid breaking Firebase Auth
// flows on the frontend.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  }),
)

// ── CORS ──────────────────────────────────────────────────────────────────────
// CLIENT_ORIGIN must match the exact origin of the React dev server (or
// the deployed frontend).  origin: "*" is intentionally avoided because
// this API uses credentials (Authorization: Bearer).
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin (server-to-server, Postman, curl)
      // and any explicitly listed frontend origin.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// ── Body parser — 10 kb ceiling ───────────────────────────────────────────────
// Prevents oversized JSON payloads from reaching controllers. 10 kb is
// more than enough for every legitimate Examora request (largest are
// exam-submission answer maps, which are small integer-keyed objects).
app.use(express.json({ limit: '10kb' }))

// ── General rate limiter ──────────────────────────────────────────────────────
// Applied to all /api/* routes before they reach their routers.
// The stricter auth limiter is applied inside authRoutes.js.
app.use('/api', generalLimiter)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Examora API is running' })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/results', resultRoutes)

// ── 404 + centralized error handler — must be last ───────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Examora API running on port ${PORT}`)
  })
})
