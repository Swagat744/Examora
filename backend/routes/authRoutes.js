import { Router } from 'express'
import { register, login, googleAuth, getMe, updateMe } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { validateRegister, validateLogin } from '../middleware/validate.js'

const router = Router()

// POST routes are the primary brute-force / credential-stuffing targets —
// the stricter authLimiter is applied in addition to the generalLimiter
// that already covers all /api/* routes in server.js.
router.post('/register', authLimiter, validateRegister, register)
router.post('/login', authLimiter, validateLogin, login)
router.post('/google', authLimiter, googleAuth)

// Protected profile routes — no extra rate limiting needed beyond the
// general limiter; these require a valid JWT to reach.
router.get('/me', protect, getMe)
router.put('/me', protect, updateMe)

export default router
