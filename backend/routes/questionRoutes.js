import { Router } from 'express'
import { getQuestionById, updateQuestion, deleteQuestion } from '../controllers/questionController.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { validateObjectId, validateUpdateQuestion } from '../middleware/validate.js'

const router = Router()

// Single-question lookup includes correctAnswer (for teacher/admin editing) —
// this endpoint is never public. validateObjectId prevents malformed IDs
// from reaching the database.
router
  .route('/:id')
  .get(protect, restrictTo('teacher', 'admin'), validateObjectId('id'), getQuestionById)
  .put(
    protect,
    restrictTo('teacher', 'admin'),
    validateObjectId('id'),
    validateUpdateQuestion,
    updateQuestion,
  )
  .delete(protect, restrictTo('teacher', 'admin'), validateObjectId('id'), deleteQuestion)

export default router
