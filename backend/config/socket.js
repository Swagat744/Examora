import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

let io = null

/**
 * Initializes Socket.IO with the existing HTTP server and CORS configuration.
 * Reuses the same allowed origins as the REST API.
 */
export function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no Origin (tools/same-origin) or in allowedOrigins list
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error(`Socket CORS: origin '${origin}' is not allowed`))
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })

  // ── Socket Authentication Middleware ─────────────────────────────────────────
  // Reuses JWT authentication. Anonymous or unauthenticated sockets are rejected.
  io.use(async (socket, next) => {
    try {
      // Token can be sent in handshake auth { token } or Authorization header
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.split(' ')[1]
          : null)

      if (!token) {
        return next(new Error('Authentication required: No token provided'))
      }

      let decoded
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
      } catch {
        return next(new Error('Authentication failed: Invalid or expired token'))
      }

      const user = await User.findById(decoded.id)
      if (!user) {
        return next(new Error('Authentication failed: User no longer exists'))
      }

      // Attach authenticated user identity to socket
      socket.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }

      next()
    } catch (err) {
      console.error('Socket authentication error:', err.message)
      next(new Error('Authentication error'))
    }
  })

  // ── Socket Connection & Room Strategy ────────────────────────────────────────
  io.on('connection', (socket) => {
    const { _id: userId, role, name } = socket.user

    console.log(`Socket connected: ${userId} (${role} - ${name})`)

    // Join specific user room for direct messaging if ever needed
    socket.join(`user:${userId}`)

    // Join role-based room (e.g. role:student) for efficient, clean broadcasts
    socket.join(`role:${role}`)

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${userId} (reason: ${reason})`)
    })
  })

  return io
}

/**
 * Accessor for the Socket.IO instance.
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet.')
  }
  return io
}

/**
 * Emits the `exam:published` event to connected students.
 * Only non-sensitive, safe exam metadata is transmitted.
 */
export function emitExamPublished(exam) {
  if (!io) {
    console.warn('Socket.IO not initialized; skipping exam:published emission.')
    return
  }

  const payload = {
    examId: exam._id ? exam._id.toString() : exam.id,
    title: exam.title,
    subject: exam.subject,
    duration: exam.duration,
    numberOfQuestions: exam.numberOfQuestions,
    totalMarks: exam.totalMarks,
    status: exam.status,
    startTime: exam.startTime,
    endTime: exam.endTime,
    message: `"${exam.title}" is now available.`,
    publishedAt: new Date().toISOString(),
  }

  // Broadcast to all connected authenticated students
  io.to('role:student').emit('exam:published', payload)

  console.log(`Exam published: ${payload.examId}`)
  console.log(`Real-time notification emitted: ${payload.examId} -> role:student`)
}
