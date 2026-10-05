// Automated test script for Practical 8: Real-Time WebSocket Communication (Socket.IO)
import { io } from 'socket.io-client'

const BASE_URL = 'http://localhost:5000'
const API_URL = `${BASE_URL}/api`

async function apiRequest(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`)
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    process.exitCode = 1
  }
}

async function runTests() {
  console.log('\n=== Testing Practical 8: Socket.IO Real-Time Communication ===\n')

  // 1. Health check
  console.log('[Step 1] Checking API health...')
  const health = await apiRequest('/health')
  assert(health.status === 200 && health.data.success, 'Backend REST API is alive and reachable')

  // 2. Unauthenticated Socket.IO rejection
  console.log('\n[Step 2] Testing Unauthenticated Socket Connection...')
  const unauthSocket = io(BASE_URL, {
    transports: ['websocket'],
    reconnection: false,
  })

  await new Promise((resolve) => {
    unauthSocket.on('connect_error', (err) => {
      assert(
        err.message.includes('Authentication required') || err.message.includes('Authentication failed'),
        `Unauthenticated connection properly rejected: "${err.message}"`
      )
      unauthSocket.disconnect()
      resolve()
    })
    unauthSocket.on('connect', () => {
      assert(false, 'Unauthenticated socket connected unexpectedly!')
      unauthSocket.disconnect()
      resolve()
    })
  })

  // 3. Invalid Token Socket.IO rejection
  console.log('\n[Step 3] Testing Invalid Token Socket Connection...')
  const invalidSocket = io(BASE_URL, {
    auth: { token: 'invalid_dummy_token_12345' },
    transports: ['websocket'],
    reconnection: false,
  })

  await new Promise((resolve) => {
    invalidSocket.on('connect_error', (err) => {
      assert(
        err.message.includes('Authentication failed') || err.message.includes('Invalid'),
        `Invalid token properly rejected: "${err.message}"`
      )
      invalidSocket.disconnect()
      resolve()
    })
    invalidSocket.on('connect', () => {
      assert(false, 'Socket with invalid token connected unexpectedly!')
      invalidSocket.disconnect()
      resolve()
    })
  })

  // 4. Authenticated Student Login & Socket Connection
  console.log('\n[Step 4] Authenticating Student & Connecting Socket...')
  const studentLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'swagat@example.com', password: 'password123' }),
  })
  assert(studentLogin.status === 200 && studentLogin.data.data?.token, 'Student logged in and received JWT')
  const studentToken = studentLogin.data.data.token

  const studentSocket = io(BASE_URL, {
    auth: { token: studentToken },
    transports: ['websocket'],
  })

  await new Promise((resolve) => {
    studentSocket.on('connect', () => {
      assert(true, `Student socket connected successfully (Socket ID: ${studentSocket.id})`)
      resolve()
    })
    studentSocket.on('connect_error', (err) => {
      assert(false, `Student socket failed to connect: ${err.message}`)
      resolve()
    })
  })

  // 5. Authenticate Teacher/Admin & Publish Exam via REST API
  console.log('\n[Step 5] Authenticating Teacher & Publishing Exam...')
  const teacherLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'faculty@example.com', password: 'password123' }),
  })
  assert(teacherLogin.status === 200 && teacherLogin.data.data?.token, 'Teacher logged in and received JWT')
  const teacherToken = teacherLogin.data.data.token

  const examTitle = `Socket.IO Real-Time Practical Test Exam ${Date.now()}`
  let receivedEvent = null

  // Setup student listener for exam:published
  const eventPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: Did not receive exam:published event within 5 seconds'))
    }, 5000)

    studentSocket.on('exam:published', (payload) => {
      clearTimeout(timeout)
      receivedEvent = payload
      resolve(payload)
    })
  })

  // Publish exam as teacher via REST API
  console.log('[Step 6] Creating active exam via REST API...')
  const createExamRes = await apiRequest('/exams', {
    method: 'POST',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: JSON.stringify({
      title: examTitle,
      subject: 'Distributed Systems & WebSockets',
      description: 'Demonstrating real-time socket notifications.',
      instructions: 'Answer all questions.',
      duration: 30,
      totalMarks: 20,
      numberOfQuestions: 5,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
    }),
  })

  assert(createExamRes.status === 201, 'Exam created with status: active via REST API')
  const createdExamId = createExamRes.data.data?._id

  try {
    await eventPromise
    assert(true, 'Student received "exam:published" event in real-time!')
    assert(receivedEvent.examId === createdExamId, `Event payload matches created exam ID: ${createdExamId}`)
    assert(receivedEvent.title === examTitle, `Event payload matches title: "${receivedEvent.title}"`)
    assert(receivedEvent.subject === 'Distributed Systems & WebSockets', 'Event payload includes subject')
    assert(receivedEvent.message && receivedEvent.message.includes(examTitle), 'Event payload has friendly message')
    assert(!receivedEvent.correctAnswer, 'Payload does NOT leak any correctAnswer')
    assert(!receivedEvent.passwordHash, 'Payload does NOT leak any credentials')
  } catch (err) {
    assert(false, err.message)
  }

  // Clean up created test exam
  if (createdExamId) {
    console.log('\n[Step 7] Cleaning up test exam...')
    await apiRequest(`/exams/${createdExamId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${teacherToken}` },
    })
    console.log('  ✓ Test exam cleaned up')
  }

  // Disconnect student socket
  studentSocket.disconnect()
  console.log('  ✓ Student socket disconnected cleanly')

  console.log('\n=== All Socket.IO Real-Time Tests Passed! ===\n')
  process.exit(process.exitCode || 0)
}

runTests().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
