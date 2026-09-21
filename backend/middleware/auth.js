import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Verifies the Bearer token on protected routes and attaches the full
// user document (minus passwordHash, which is select:false) to req.user.
// Every controller that needs "the current user" reads req.user._id —
// never a user ID supplied in the request body or query string.
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }

  const token = header.split(' ')[1]

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' })
  }

  const user = await User.findById(decoded.id)
  if (!user) {
    return res.status(401).json({ success: false, message: 'User no longer exists' })
  }

  req.user = user
  next()
})

// Role gate — used after `protect` on routes that only teachers/admins
// should reach (e.g. creating an exam). Normal signup always produces a
// 'student', so reaching one of these roles means the account was
// promoted deliberately (e.g. via the seed script), not through signup.
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to do this' })
    }
    next()
  }
}
