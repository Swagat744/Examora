/**
 * Exam controller (Practical 5 – Secure REST APIs: mass-assignment hardening)
 *
 * createExam and updateExam explicitly whitelist which fields from the
 * request body are allowed to reach the database. This prevents a client
 * from injecting internal or unrelated fields (e.g. _id, createdAt,
 * arbitrary metadata) simply by including them in the JSON body.
 *
 * Fields that are always server-controlled and never accepted from clients:
 *   _id, createdAt, updatedAt
 */

import { Exam } from '../models/Exam.js'
import { Question } from '../models/Question.js'
import { Attempt } from '../models/Attempt.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Whitelist of fields a client is allowed to set when creating/updating an exam.
// Timestamps and internal identifiers are controlled by Mongoose, not the client.
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

// GET /api/exams
export const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: exams })
})

// GET /api/exams/:id
export const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  res.status(200).json({ success: true, data: exam })
})

// POST /api/exams
export const createExam = asyncHandler(async (req, res) => {
  // Only whitelisted fields reach the database — no arbitrary client fields.
  const exam = await Exam.create(pickExamFields(req.body))
  res.status(201).json({ success: true, data: exam })
})

// PUT /api/exams/:id
export const updateExam = asyncHandler(async (req, res) => {
  // Same whitelist for updates — a client cannot overwrite _id, timestamps,
  // or any field not in ALLOWED_EXAM_FIELDS.
  const exam = await Exam.findByIdAndUpdate(req.params.id, pickExamFields(req.body), {
    new: true,
    runValidators: true,
  })

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  res.status(200).json({ success: true, data: exam })
})

// DELETE /api/exams/:id
export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id)

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  // Keep related collections consistent — orphaned questions and attempt
  // records serve no purpose after the exam is gone.
  await Question.deleteMany({ exam: exam._id })
  await Attempt.deleteMany({ exam: exam._id })

  res.status(200).json({ success: true, data: {} })
})
