/**
 * Exam controller (Practical 5 – Secure REST APIs: mass-assignment hardening)
 *
 * createExam and updateExam explicitly whitelist which fields from the
 * request body are allowed to reach the database. This prevents a client
 * from injecting internal or unrelated fields (e.g. _id, createdAt,
 * arbitrary metadata) simply by including them in the JSON body.
 *
 * Fields that are always server-controlled and never accepted from clients:
 *   _id, createdAt, updatedAt, createdBy
 */

import jwt from 'jsonwebtoken'
import { Exam } from '../models/Exam.js'
import { Question } from '../models/Question.js'
import { Attempt } from '../models/Attempt.js'
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { emitExamPublished } from '../config/socket.js'

// Whitelist of fields a client is allowed to set when creating/updating an exam.
// Timestamps, internal identifiers, and createdBy are controlled by the
// server, not the client.
const ALLOWED_EXAM_FIELDS = [
  'title',
  'subject',
  'description',
  'instructions',
  'duration',
  'totalMarks',
  'numberOfQuestions',
  'startTime',
  'endTime',
  'status',
]

function pickExamFields(body) {
  const picked = {}
  for (const field of ALLOWED_EXAM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      picked[field] = body[field]
    }
  }
  return picked
}

// Ownership check: teachers can only modify their own exams; admins can
// modify any exam. Exams created before the `createdBy` field was added
// (null) are treated as admin-owned — only admins can modify them.
function canModifyExam(user, exam) {
  if (user.role === 'admin') return true
  if (!exam.createdBy) return false // legacy exam without owner → admin-only
  return String(exam.createdBy) === String(user._id)
}

// Helper to determine if the caller has valid teacher or admin credentials
async function checkIsPrivileged(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    return Boolean(user && ['teacher', 'admin'].includes(user.role))
  } catch {
    return false
  }
}

// GET /api/exams
export const getExams = asyncHandler(async (req, res) => {
  const isPrivileged = await checkIsPrivileged(req)
  // For students and unauthenticated users, never reveal draft exams
  const query = isPrivileged ? {} : { status: { $ne: 'draft' } }
  const exams = await Exam.find(query).sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: exams })
})

// GET /api/exams/:id
export const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  // Unpublished draft exams are only accessible by faculty or admin
  if (exam.status === 'draft') {
    const isPrivileged = await checkIsPrivileged(req)
    if (!isPrivileged) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }
  }

  const attemptCount = await Attempt.countDocuments({ exam: exam._id })
  const data = exam.toObject()
  data.attemptCount = attemptCount

  res.status(200).json({ success: true, data })
})

// POST /api/exams
export const createExam = asyncHandler(async (req, res) => {
  // Only whitelisted fields reach the database — no arbitrary client fields.
  // createdBy is set from the authenticated user, never from the request body.
  const exam = await Exam.create({
    ...pickExamFields(req.body),
    createdBy: req.user._id,
  })

  // Real-time notification: If created as active (available) or scheduled, broadcast event
  if (exam.status === 'active' || exam.status === 'scheduled') {
    emitExamPublished(exam)
  }

  res.status(201).json({ success: true, data: exam })
})

// PUT /api/exams/:id
export const updateExam = asyncHandler(async (req, res) => {
  const previousExam = await Exam.findById(req.params.id)
  if (!previousExam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  // Ownership check — teachers can only update their own exams
  if (!canModifyExam(req.user, previousExam)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to modify this exam',
    })
  }

  // Same whitelist for updates — a client cannot overwrite _id, timestamps,
  // createdBy, or any field not in ALLOWED_EXAM_FIELDS.
  const exam = await Exam.findByIdAndUpdate(req.params.id, pickExamFields(req.body), {
    returnDocument: 'after',
    runValidators: true,
  })

  // Real-time notification: If exam is transitioned to active or scheduled, broadcast event
  const wasNotActive = previousExam.status !== 'active'
  const isNowActive = exam.status === 'active'
  const wasDraft = previousExam.status === 'draft'
  const isNowScheduled = exam.status === 'scheduled'

  if ((wasNotActive && isNowActive) || (wasDraft && isNowScheduled)) {
    emitExamPublished(exam)
  }

  res.status(200).json({ success: true, data: exam })
})

// DELETE /api/exams/:id
export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  // Ownership check — teachers can only delete their own exams
  if (!canModifyExam(req.user, exam)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this exam',
    })
  }

  await Exam.findByIdAndDelete(req.params.id)

  // Keep related collections consistent — orphaned questions and attempt
  // records serve no purpose after the exam is gone.
  await Question.deleteMany({ exam: exam._id })
  await Attempt.deleteMany({ exam: exam._id })

  res.status(200).json({ success: true, data: {} })
})
