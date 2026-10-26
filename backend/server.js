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

import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { connectDB } from './config/db.js'
import { initSocket } from './config/socket.js'
import authRoutes from './routes/authRoutes.js'
import examRoutes from './routes/examRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { generalLimiter } from './middleware/rateLimiter.js'

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
const defaultOrigins = ['http://localhost:5173', 'https://examora-frontend.onrender.com']
const envOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

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

// ── Route prefix normalization ───────────────────────────────────────────────
// If a client or legacy frontend build makes calls without the '/api' prefix
// (e.g. /auth/*, /exams/*, /questions/*, /results/*, /health), rewrite to '/api/*'
// so that all rate limiters, security policies, and routes apply consistently.
app.use((req, res, next) => {
  if (
    !req.url.startsWith('/api') &&
    (req.url.startsWith('/auth') ||
      req.url.startsWith('/exams') ||
      req.url.startsWith('/questions') ||
      req.url.startsWith('/results') ||
      req.url.startsWith('/health'))
  ) {
    req.url = `/api${req.url}`
  }
  next()
})

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
app.use('/auth', generalLimiter, authRoutes) // Fallback alias for clients hitting /auth directly
app.use('/api/exams', examRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/results', resultRoutes)

// ── 404 + centralized error handler — must be last ───────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
const server = http.createServer(app)

// Initialize Socket.IO with the HTTP server and allowed CORS origins
initSocket(server, allowedOrigins)

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Examora API & Socket.IO running on port ${PORT}`)
  })
})
