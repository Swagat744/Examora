import { Router } from 'express'
import { getMyResults, getResultById, getAllResults } from '../controllers/attemptController.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { validateObjectId } from '../middleware/validate.js'

const router = Router()

// Every route here requires a valid token
router.use(protect)

router.get('/', getMyResults)
router.get('/all', restrictTo('teacher', 'admin'), getAllResults)
router.get('/:id', validateObjectId('id'), getResultById)

export default router
