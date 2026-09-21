/**
 * Practical 5 – Security Middleware Test Script
 * Run: node test-security.mjs
 *
 * Tests security middleware in isolation (no MongoDB needed).
 */
import http from 'http'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js'
import {
  validateRegister,
  validateLogin,
  validateObjectId,
  validateCreateExam,
  validateCreateQuestion,
} from './middleware/validate.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

// ── Minimal test app ─────────────────────────────────────────────────────────

const app = express()

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))

const allowedOrigins = ['http://localhost:5173']
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS: origin not allowed')),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json({ limit: '10kb' }))
app.use('/api', generalLimiter)

app.post('/api/auth/register', authLimiter, validateRegister, (req, res) => res.json({ success: true }))
app.post('/api/auth/login', authLimiter, validateLogin, (req, res) => res.json({ success: true }))
app.get('/api/exams/:id', validateObjectId('id'), (req, res) =>
  res.json({ success: true, id: req.params.id }),
)
app.post('/api/exams', validateCreateExam, (req, res) => res.json({ success: true }))
app.post('/api/exams/:examId/questions', validateObjectId('examId'), validateCreateQuestion, (req, res) =>
  res.json({ success: true }),
)
app.use(notFound)
app.use(errorHandler)

// ── HTTP helper ───────────────────────────────────────────────────────────────

function call(method, path, body, extraHeaders = {}) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5099,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...extraHeaders,
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          const secHeaders = {
            xco: res.headers['x-content-type-options'],
            xfo: res.headers['x-frame-options'],
          }
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw), headers: secHeaders })
          } catch {
            resolve({ status: res.statusCode, body: raw, headers: secHeaders })
          }
        })
      },
    )
    req.on('error', (e) => resolve({ status: 0, error: e.message }))
    if (data) req.write(data)
    req.end()
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function check(label, condition, extra = '') {
  if (condition) {
    console.log(`  ✓ ${label}${extra ? ' — ' + extra : ''}`)
    passed++
  } else {
    console.log(`  ✗ ${label}${extra ? ' — ' + extra : ''}`)
    failed++
  }
}

const server = app.listen(5099, async () => {
  console.log('\n=== Practical 5 – Security Middleware Tests ===\n')

  let r

  // ── 1. Helmet ──────────────────────────────────────────────────────────────
  console.log('Helmet headers:')
  r = await call('GET', '/api/exams/507f1f77bcf86cd799439011')
  check('X-Content-Type-Options: nosniff', r.headers.xco === 'nosniff', r.headers.xco)
  check('X-Frame-Options present', !!r.headers.xfo, r.headers.xfo)

  // ── 2. ObjectId validation ─────────────────────────────────────────────────
  console.log('\nObjectId validation:')
  r = await call('GET', '/api/exams/507f1f77bcf86cd799439011')
  check('Valid ObjectId → 200', r.status === 200)

  r = await call('GET', '/api/exams/not-a-valid-id')
  check('Invalid ObjectId → 400', r.status === 400, r.body.message)

  r = await call('GET', '/api/exams/123short')
  check('Short invalid ID → 400', r.status === 400)

  // ── 3. Auth validation ─────────────────────────────────────────────────────
  console.log('\nAuth validation:')
  r = await call('POST', '/api/auth/login', { email: '', password: '' })
  check('Empty login → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/auth/login', { email: 'a@b.com', password: 'pass' })
  check('Valid login fields pass → not 400', r.status !== 400)

  r = await call('POST', '/api/auth/register', {
    name: 'Test',
    email: 'not-an-email',
    password: 'password123',
    confirmPassword: 'password123',
  })
  check('Invalid email → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/auth/register', {
    name: 'Test',
    email: 'a@b.com',
    password: 'short',
    confirmPassword: 'short',
  })
  check('Short password → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/auth/register', {
    name: 'Test',
    email: 'a@b.com',
    password: 'password123',
    confirmPassword: 'mismatch',
  })
  check('Password mismatch → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/auth/register', {
    name: 'Test',
    email: 'a@b.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  check('Valid register fields pass validate → not 400', r.status !== 400)

  // ── 4. Exam validation ─────────────────────────────────────────────────────
  console.log('\nExam validation:')
  r = await call('POST', '/api/exams', { title: 'Test' })
  check('Missing required exam fields → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/exams', {
    title: 'Math Exam',
    subject: 'Math',
    duration: -5,
    totalMarks: 100,
    numberOfQuestions: 10,
    startTime: new Date().toISOString(),
  })
  check('Negative duration → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/exams', {
    title: 'Math Exam',
    subject: 'Math',
    duration: 60,
    totalMarks: 100,
    numberOfQuestions: 10,
    startTime: 'not-a-date',
  })
  check('Invalid startTime → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/exams', {
    title: 'Math Exam',
    subject: 'Math',
    duration: 60,
    totalMarks: 100,
    numberOfQuestions: 10,
    startTime: new Date().toISOString(),
    status: 'hacked',
  })
  check('Invalid status enum → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/exams', {
    title: 'Math Exam',
    subject: 'Math',
    duration: 60,
    totalMarks: 100,
    numberOfQuestions: 10,
    startTime: new Date().toISOString(),
  })
  check('Valid exam data passes validate → not 400', r.status !== 400)

  // ── 5. Question validation ─────────────────────────────────────────────────
  console.log('\nQuestion validation:')
  r = await call('POST', '/api/exams/507f1f77bcf86cd799439011/questions', {
    questionText: 'What is 2+2?',
    options: ['one'],
    correctAnswer: 0,
  })
  check('< 2 options → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/exams/507f1f77bcf86cd799439011/questions', {
    questionText: 'What is 2+2?',
    options: ['3', '4', '5'],
    correctAnswer: 5,
  })
  check('correctAnswer out of range → 400', r.status === 400, r.body.message)

  r = await call('POST', '/api/exams/507f1f77bcf86cd799439011/questions', {
    questionText: 'What is 2+2?',
    options: ['3', '4', '5'],
    correctAnswer: 1,
  })
  check('Valid question passes validate → not 400', r.status !== 400)

  // ── 6. Body size limit ─────────────────────────────────────────────────────
  console.log('\nBody size limit:')
  const oversized = JSON.stringify({ data: 'x'.repeat(15000) })
  r = await new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5099,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(oversized) },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }) }
          catch { resolve({ status: res.statusCode }) }
        })
      },
    )
    req.on('error', (e) => resolve({ status: 0 }))
    req.write(oversized)
    req.end()
  })
  check('Oversized body → 413', r.status === 413)

  // ── 7. CORS ────────────────────────────────────────────────────────────────
  console.log('\nCORS:')
  r = await call('GET', '/api/exams/507f1f77bcf86cd799439011', null, { Origin: 'http://evil.com' })
  check('Blocked CORS origin → 403', r.status === 403)

  r = await call('GET', '/api/exams/507f1f77bcf86cd799439011', null, { Origin: 'http://localhost:5173' })
  check('Allowed CORS origin → 200', r.status === 200)

  r = await call('GET', '/api/exams/507f1f77bcf86cd799439011')
  check('No Origin (Postman) → 200', r.status === 200)

  // ── 8. 404 ────────────────────────────────────────────────────────────────
  console.log('\nError handling:')
  r = await call('GET', '/api/completely-unknown-route')
  check('Unknown route → 404', r.status === 404, r.body.message)
  check('Error response has success:false', r.body.success === false)

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`)
  server.close()
  process.exit(failed > 0 ? 1 : 0)
})
