import { io } from 'socket.io-client'
import { getToken } from './apiClient'

// Socket URL: Use VITE_SOCKET_URL if provided, else derive by stripping /api from VITE_API_URL
const resolveSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

const SOCKET_URL = resolveSocketUrl()

let socket = null

/**
 * Initializes and connects the Socket.IO client using the authenticated user's JWT.
 * Prevents multiple socket instances and reuses existing connection when active.
 */
export function connectSocket() {
  const token = getToken()
  if (!token) {
    // Cannot authenticate socket without a token
    return null
  }

  if (socket) {
    // If already connected with the current token, return existing instance
    if (socket.connected) {
      return socket
    }
    // Update token in case of token refresh / re-login
    socket.auth = { token }
    socket.connect()
    return socket
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true,
  })

  socket.on('connect_error', (err) => {
    // Safe error handling — does not crash the application
    console.warn('[Socket.IO] Connection error:', err.message)
  })

  return socket
}

/**
 * Returns the current socket instance.
 */
export function getSocket() {
  return socket
}

/**
 * Disconnects the socket connection cleanly (e.g. on user logout).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Subscribes to the real-time `exam:published` event.
 * Returns an unsubscribe cleanup function to prevent memory leaks and duplicate listeners.
 */
export function subscribeToExamPublished(callback) {
  const s = connectSocket()
  if (!s) return () => {}

  const handler = (payload) => {
    callback(payload)
  }

  s.on('exam:published', handler)

  return () => {
    s.off('exam:published', handler)
  }
}

/**
 * Subscribes to connection state changes (useful for live status indicator).
 * Returns an unsubscribe cleanup function.
 */
export function subscribeConnectionStatus(callback) {
  const s = connectSocket()
  if (!s) {
    callback(false)
    return () => {}
  }

  // Initial status
  callback(s.connected)

  const onConnect = () => callback(true)
  const onDisconnect = () => callback(false)
  const onConnectError = () => callback(false)

  s.on('connect', onConnect)
  s.on('disconnect', onDisconnect)
  s.on('connect_error', onConnectError)

  return () => {
    s.off('connect', onConnect)
    s.off('disconnect', onDisconnect)
    s.off('connect_error', onConnectError)
  }
}
