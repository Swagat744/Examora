import { Router } from 'express'
import { getExams, getExamById, createExam, updateExam, deleteExam } from '../controllers/examController.js'
import { getQuestionsForExam, createQuestion } from '../controllers/questionController.js'
import { submitAttempt } from '../controllers/attemptController.js'
import { protect, restrictTo } from '../middleware/auth.js'
import {
  validateObjectId,
  validateCreateExam,
  validateUpdateExam,
  validateCreateQuestion,
} from '../middleware/validate.js'

const router = Router()

// GET /api/exams  — public (exam listing for landing page/dashboard)
// POST /api/exams — teacher/admin only
router
  .route('/')
  .get(getExams)
  .post(protect, restrictTo('teacher', 'admin'), validateCreateExam, createExam)

// Validate :id is a well-formed ObjectId before any DB operation on /:id routes
router
  .route('/:id')
  .get(validateObjectId('id'), getExamById)
  .put(protect, restrictTo('teacher', 'admin'), validateObjectId('id'), validateUpdateExam, updateExam)
  .delete(protect, restrictTo('teacher', 'admin'), validateObjectId('id'), deleteExam)

// Questions nested under exams — auth required (students taking the exam
// need a token; teachers/admins need one too to create questions)
router
  .route('/:examId/questions')
  .get(protect, validateObjectId('examId'), getQuestionsForExam)
  .post(protect, restrictTo('teacher', 'admin'), validateObjectId('examId'), validateCreateQuestion, createQuestion)

// Attempt submission — requires auth; student identity always from token
router.post('/:examId/attempts', protect, validateObjectId('examId'), submitAttempt)

export default router
