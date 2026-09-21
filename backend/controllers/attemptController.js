import { Exam } from '../models/Exam.js'
import { Question } from '../models/Question.js'
import { Attempt } from '../models/Attempt.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// POST /api/exams/:examId/attempts
// Body: { answers: { [questionId]: selectedOptionIndex }, startedAt }
//
// The frontend sends only what the student picked. Every fact needed to
// grade the attempt — questions, correct answers, per-question marks —
// is re-read from the database here. A score sent by the client is
// never accepted.
export const submitAttempt = asyncHandler(async (req, res) => {
  const { examId } = req.params
  const { answers = {}, startedAt } = req.body

  const exam = await Exam.findById(examId)
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' })
  }

  const existing = await Attempt.findOne({ student: req.user._id, exam: examId })
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already submitted this examination' })
  }

  const questions = await Question.find({ exam: examId })
  if (questions.length === 0) {
    return res.status(400).json({ success: false, message: 'This exam has no questions to grade' })
  }

  let score = 0
  let correctCount = 0
  let incorrectCount = 0
  let unansweredCount = 0
  let totalMarks = 0

  for (const question of questions) {
    totalMarks += question.marks
    const qid = String(question._id)
    const selected = Object.prototype.hasOwnProperty.call(answers, qid) ? answers[qid] : undefined

    if (selected === undefined || selected === null) {
      unansweredCount += 1
      continue
    }

    // Reject an option index that isn't valid for this question rather
    // than silently treating it as correct or incorrect.
    if (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid answer option for question ${qid}`,
      })
    }

    if (selected === question.correctAnswer) {
      score += question.marks
      correctCount += 1
    } else {
      incorrectCount += 1
    }
  }

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 10000) / 100 : 0

  const attempt = await Attempt.create({
    student: req.user._id,
    exam: examId,
    answers,
    score,
    totalMarks,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    submittedAt: new Date(),
  })

  res.status(201).json({ success: true, data: attempt })
})

// GET /api/results/all — teacher/admin only; returns recent student attempts across the platform.
export const getAllResults = asyncHandler(async (req, res) => {
  const attempts = await Attempt.find()
    .populate('student', 'name email')
    .populate('exam', 'title subject totalMarks')
    .sort({ submittedAt: -1 })
    .limit(50)

  res.status(200).json({ success: true, data: attempts })
})

// GET /api/results — the authenticated student's own results only.
// The user ID always comes from req.user (set by the auth middleware
// from the verified token), never from a query parameter.
export const getMyResults = asyncHandler(async (req, res) => {
  const attempts = await Attempt.find({ student: req.user._id })
    .populate('exam', 'title subject')
    .sort({ submittedAt: -1 })

  res.status(200).json({ success: true, data: attempts })
})

// GET /api/results/:id — one result. Students see only their own; teachers/admins see any.
export const getResultById = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id)
    .populate('student', 'name email')
    .populate('exam', 'title subject')

  if (!attempt) {
    return res.status(404).json({ success: false, message: 'Result not found' })
  }

  const isPrivileged = req.user && ['teacher', 'admin'].includes(req.user.role)
  if (String(attempt.student._id || attempt.student) !== String(req.user._id) && !isPrivileged) {
    // Same 404 as "doesn't exist" — don't confirm to a caller that a
    // result exists for someone else's account.
    return res.status(404).json({ success: false, message: 'Result not found' })
  }

  res.status(200).json({ success: true, data: attempt })
})
