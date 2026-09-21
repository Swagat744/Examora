/**
 * Centralized error-handling middleware (Practical 5 – Secure REST APIs)
 *
 * All thrown or forwarded errors land here. Mongoose-specific error types
 * are mapped to appropriate HTTP status codes and user-friendly messages.
 *
 * Production safety: stack traces and internal error details are never
 * sent to the client. In development, the full error is logged to the
 * console for debugging. In production, only the sanitized message is
 * logged to avoid exposing secrets or paths in server logs.
 */

const IS_DEV = process.env.NODE_ENV !== 'production'

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` })
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  // ── Mongoose: bad ObjectId (e.g. GET /api/exams/not-a-valid-id) ───────────
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: '${err.value}' is not a valid ID`
  }

  // ── Mongoose: schema validation failure ───────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }

  // ── Mongoose: duplicate key (e.g. duplicate email, duplicate attempt) ─────
  if (err.code === 11000) {
    statusCode = 409
    message = `Duplicate value for field: ${Object.keys(err.keyValue).join(', ')}`
  }

  // ── CORS error from the cors() middleware ─────────────────────────────────
  if (err.message && err.message.startsWith('CORS:')) {
    statusCode = 403
    message = err.message
  }

  // ── Payload too large (express.json body-size limit exceeded) ─────────────
  if (err.type === 'entity.too.large') {
    statusCode = 413
    message = 'Request payload is too large'
  }

  // ── Logging ───────────────────────────────────────────────────────────────
  // Development: log the full error including stack trace.
  // Production: log only the essential info — never passwords, tokens, or
  // connection strings that may appear in the raw error object.
  if (IS_DEV) {
    console.error('[ErrorHandler]', err)
  } else {
    console.error(`[ErrorHandler] ${statusCode} ${message}`)
  }

  // ── Never expose internal details to the client ───────────────────────────
  // For unexpected 500s in production, replace the message with a generic
  // one so stack traces / DB details cannot leak through err.message.
  if (statusCode === 500 && !IS_DEV) {
    message = 'An unexpected error occurred. Please try again later.'
  }

  res.status(statusCode).json({ success: false, message })
}
