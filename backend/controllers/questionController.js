/**
 * Question controller (Practical 5 – Secure REST APIs: mass-assignment hardening)
 *
 * createQuestion and updateQuestion explicitly whitelist which fields from
 * the request body are allowed to reach the database.
 *
 * The `exam` reference is set from the validated :examId route parameter,
 * never from req.body, so a client cannot forge question ownership.
 *
 * Fields that are always server-controlled and never accepted from clients:
 *   _id, exam (on create — set from route param), createdAt, updatedAt
 */

import { Exam } from '../models/Exam.js'
import { Question } from '../models/Question.js'
import { Attempt } from '../models/Attempt.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Whitelist for question creation (exam is set from the route param, not body)
const ALLOWED_QUESTION_CREATE_FIELDS = [
  'questionText',
  'options',
  'correctAnswer',
  'marks',
  'questionOrder',
]

// Whitelist for question updates (exam reference cannot be changed)
const ALLOWED_QUESTION_UPDATE_FIELDS = [
  'questionText',
  'options',
  'correctAnswer',
  'marks',
  'questionOrder',
]

function pickFields(body, allowed) {
  const picked = {}
  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      picked[field] = body[field]
    }
  }
  return picked
}

function canModifyExam(user, exam) {
  if (!user) return false
  if (user.role === 'admin') return true
  if (!exam.createdBy) return false
  return String(exam.createdBy) === String(user._id)
}

async function syncExamStats(examId) {
  if (!examId) return
  const questions = await Question.find({ exam: examId })
  const numberOfQuestions = questions.length
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)
  await Exam.findByIdAndUpdate(examId, { numberOfQuestions, totalMarks })
}

// GET /api/exams/:examId/questions
// Teacher/admin receives full questions including correctAnswer for management.
// Student-facing: correctAnswer is stripped by Question.toPublicJSON().
export const getQuestionsForExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId)
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  const isPrivileged = req.user && ['teacher', 'admin'].includes(req.user.role)
  if (exam.status === 'draft' && !isPrivileged) {
    return res.status(403).json({ success: false, message: 'This examination is not published yet' })
  }

  const questions = await Question.find({ exam: exam._id }).sort({ questionOrder: 1 })
  const resultData = isPrivileged ? questions : questions.map((q) => q.toPublicJSON())

  res.status(200).json({ success: true, data: resultData })
})

// GET /api/questions/:id
// Teacher/admin-facing: includes correctAnswer (for editing).
export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)

  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' })
  }

  res.status(200).json({ success: true, data: question })
})

// POST /api/exams/:examId/questions
export const createQuestion = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId)
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  if (!canModifyExam(req.user, exam)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to add questions to this exam',
    })
  }

  const attemptCount = await Attempt.countDocuments({ exam: exam._id })
  if (attemptCount > 0) {
    return res.status(409).json({
      success: false,
      message: 'Cannot add questions after students have started attempting this exam',
    })
  }

  // The exam reference comes from the authenticated route parameter —
  // never from req.body — so a client cannot set it to a different exam.
  const question = await Question.create({
    ...pickFields(req.body, ALLOWED_QUESTION_CREATE_FIELDS),
    exam: exam._id,
  })

  // Synchronize exam question count and total marks
  await syncExamStats(exam._id)

  res.status(201).json({ success: true, data: question })
})

// PUT /api/questions/:id
export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)
  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' })
  }

  const exam = await Exam.findById(question.exam)
  if (exam) {
    if (!canModifyExam(req.user, exam)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify questions for this exam',
      })
    }

    const attemptCount = await Attempt.countDocuments({ exam: exam._id })
    if (attemptCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot modify questions after students have started attempting this exam',
      })
    }
  }

  // Only whitelisted fields are applied — the exam reference, _id, and
  // timestamps cannot be changed by a client.
  const updates = pickFields(req.body, ALLOWED_QUESTION_UPDATE_FIELDS)
  Object.assign(question, updates)
  const updatedQuestion = await question.save()

  // Synchronize exam stats if marks changed
  await syncExamStats(question.exam)

  res.status(200).json({ success: true, data: updatedQuestion })
})

// DELETE /api/questions/:id
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)

  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' })
  }

  const exam = await Exam.findById(question.exam)
  if (exam) {
    if (!canModifyExam(req.user, exam)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete questions for this exam',
      })
    }

    const attemptCount = await Attempt.countDocuments({ exam: exam._id })
    if (attemptCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete questions after students have started attempting this exam',
      })
    }
  }

  await Question.findByIdAndDelete(req.params.id)

  // Synchronize exam stats after question deletion
  await syncExamStats(question.exam)

  res.status(200).json({ success: true, data: {} })
})
