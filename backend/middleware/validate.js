/**
 * Request-level input validation middleware (Practical 5 – Secure REST APIs)
 *
 * These middleware functions run BEFORE controllers and reject malformed
 * requests early — before any database operation — with a clear HTTP 400
 * and a JSON error message.
 *
 * They complement (not replace) Mongoose schema validation:
 *   • Mongoose validates data types and constraints at the model layer.
 *   • These validators enforce request-shape rules that are cleaner to
 *     check here (e.g. required field presence, email format, ObjectId
 *     format), giving the client a more actionable error message faster.
 *
 * All responses follow the same { success: false, message } shape used
 * everywhere else in the Examora API.
 */

import mongoose from 'mongoose'

// ── Utility ───────────────────────────────────────────────────────────────────

function fail(res, message) {
  return res.status(400).json({ success: false, message })
}

// ── ObjectId parameter validation ─────────────────────────────────────────────
//
// Usage:  router.get('/:id', validateObjectId('id'), controller)
//
// Returns a 400 with a clear message before the controller ever runs,
// so Mongoose never sees a value it can't cast and the error handler
// doesn't need to interpret a CastError as a 404 guess.

export function validateObjectId(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName]
    if (!mongoose.isValidObjectId(value)) {
      return fail(res, `Invalid ${paramName}: '${value}' is not a valid ID`)
    }
    next()
  }
}

// ── Auth endpoint validators ───────────────────────────────────────────────────

// POST /api/auth/register
export function validateRegister(req, res, next) {
  const { name, email, password, confirmPassword } = req.body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return fail(res, 'Name is required')
  }
  if (!email || typeof email !== 'string') {
    return fail(res, 'Email is required')
  }
  // Basic format check — the User model also validates this
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return fail(res, 'Enter a valid email address')
  }
  if (!password || typeof password !== 'string') {
    return fail(res, 'Password is required')
  }
  if (password.length < 8) {
    return fail(res, 'Password must be at least 8 characters')
  }
  if (!confirmPassword) {
    return fail(res, 'Please confirm your password')
  }
  if (password !== confirmPassword) {
    return fail(res, 'Passwords do not match')
  }

  next()
}

// POST /api/auth/login
export function validateLogin(req, res, next) {
  const { email, password } = req.body

  if (!email || typeof email !== 'string' || !email.trim()) {
    return fail(res, 'Email is required')
  }
  if (!password || typeof password !== 'string') {
    return fail(res, 'Password is required')
  }

  next()
}

// ── Exam validators ────────────────────────────────────────────────────────────

const EXAM_STATUSES = ['draft', 'scheduled', 'active', 'completed', 'archived']

// POST /api/exams
export function validateCreateExam(req, res, next) {
  const { title, subject, duration, totalMarks, numberOfQuestions, startTime } = req.body

  if (!title || typeof title !== 'string' || !title.trim()) {
    return fail(res, 'Exam title is required')
  }
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return fail(res, 'Subject is required')
  }
  if (duration === undefined || duration === null) {
    return fail(res, 'Duration is required')
  }
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration < 1) {
    return fail(res, 'Duration must be a positive number (minutes)')
  }
  if (totalMarks === undefined || totalMarks === null) {
    return fail(res, 'Total marks is required')
  }
  if (typeof totalMarks !== 'number' || !Number.isFinite(totalMarks) || totalMarks < 0) {
    return fail(res, 'Total marks must be a non-negative number')
  }
  if (numberOfQuestions === undefined || numberOfQuestions === null) {
    return fail(res, 'Number of questions is required')
  }
  if (
    typeof numberOfQuestions !== 'number' ||
    !Number.isInteger(numberOfQuestions) ||
    numberOfQuestions < 0
  ) {
    return fail(res, 'Number of questions must be a non-negative integer')
  }
  if (!startTime) {
    return fail(res, 'Start time is required')
  }
  if (isNaN(Date.parse(startTime))) {
    return fail(res, 'Start time must be a valid date')
  }
  if (req.body.status && !EXAM_STATUSES.includes(req.body.status)) {
    return fail(res, `status must be one of: ${EXAM_STATUSES.join(', ')}`)
  }

  next()
}

// PUT /api/exams/:id  — partial update; only validate fields that are present
export function validateUpdateExam(req, res, next) {
  const { title, subject, duration, totalMarks, numberOfQuestions, startTime, status } = req.body

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return fail(res, 'Exam title must be a non-empty string')
  }
  if (subject !== undefined && (typeof subject !== 'string' || !subject.trim())) {
    return fail(res, 'Subject must be a non-empty string')
  }
  if (duration !== undefined && (typeof duration !== 'number' || !Number.isFinite(duration) || duration < 1)) {
    return fail(res, 'Duration must be a positive number (minutes)')
  }
  if (totalMarks !== undefined && (typeof totalMarks !== 'number' || !Number.isFinite(totalMarks) || totalMarks < 0)) {
    return fail(res, 'Total marks must be a non-negative number')
  }
  if (
    numberOfQuestions !== undefined &&
    (typeof numberOfQuestions !== 'number' || !Number.isInteger(numberOfQuestions) || numberOfQuestions < 0)
  ) {
    return fail(res, 'Number of questions must be a non-negative integer')
  }
  if (startTime !== undefined && isNaN(Date.parse(startTime))) {
    return fail(res, 'Start time must be a valid date')
  }
  if (status !== undefined && !EXAM_STATUSES.includes(status)) {
    return fail(res, `status must be one of: ${EXAM_STATUSES.join(', ')}`)
  }

  next()
}

// ── Question validators ────────────────────────────────────────────────────────

// POST /api/exams/:examId/questions
export function validateCreateQuestion(req, res, next) {
  const { questionText, options, correctAnswer, marks } = req.body

  if (!questionText || typeof questionText !== 'string' || !questionText.trim()) {
    return fail(res, 'Question text is required')
  }
  if (!Array.isArray(options) || options.length < 2) {
    return fail(res, 'A question needs at least 2 options')
  }
  if (options.some((o) => typeof o !== 'string' || !o.trim())) {
    return fail(res, 'Each option must be a non-empty string')
  }
  if (correctAnswer === undefined || correctAnswer === null) {
    return fail(res, 'correctAnswer index is required')
  }
  if (
    !Number.isInteger(correctAnswer) ||
    correctAnswer < 0 ||
    correctAnswer >= options.length
  ) {
    return fail(res, 'correctAnswer must be a valid index into options')
  }
  if (marks !== undefined && (typeof marks !== 'number' || !Number.isFinite(marks) || marks < 0)) {
    return fail(res, 'Marks must be a non-negative number')
  }
  if (
    req.body.questionOrder !== undefined &&
    (typeof req.body.questionOrder !== 'number' || !Number.isFinite(req.body.questionOrder))
  ) {
    return fail(res, 'questionOrder must be a number')
  }

  next()
}

// PUT /api/questions/:id  — partial update
export function validateUpdateQuestion(req, res, next) {
  const { questionText, options, correctAnswer, marks } = req.body

  if (questionText !== undefined && (typeof questionText !== 'string' || !questionText.trim())) {
    return fail(res, 'Question text must be a non-empty string')
  }

  const updatedOptions = options !== undefined ? options : null

  if (updatedOptions !== null) {
    if (!Array.isArray(updatedOptions) || updatedOptions.length < 2) {
      return fail(res, 'A question needs at least 2 options')
    }
    if (updatedOptions.some((o) => typeof o !== 'string' || !o.trim())) {
      return fail(res, 'Each option must be a non-empty string')
    }
  }

  if (correctAnswer !== undefined) {
    const optLen = updatedOptions ? updatedOptions.length : Infinity
    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= optLen) {
      return fail(res, 'correctAnswer must be a valid index into options')
    }
  }

  if (marks !== undefined && (typeof marks !== 'number' || !Number.isFinite(marks) || marks < 0)) {
    return fail(res, 'Marks must be a non-negative number')
  }

  next()
}
