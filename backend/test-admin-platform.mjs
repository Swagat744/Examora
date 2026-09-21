// Automated verification test for Examora Admin & Teacher Platform
const BASE = 'http://localhost:5000/api'

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, data: json }
}

async function runTests() {
  console.log('\n=== Testing Examora Admin & Teacher Platform ===\n')
  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${message}`)
      failed++
    }
  }

  // 1. Logins
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'swagat@example.com', password: 'password123' }),
  })
  assert(studentLogin.status === 200 && studentLogin.data.data?.token, 'Student login succeeds (role: student)')
  const studentToken = studentLogin.data.data?.token

  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
  })
  assert(adminLogin.status === 200 && adminLogin.data.data?.user?.role === 'admin', 'Admin login succeeds (role: admin)')
  const adminToken = adminLogin.data.data?.token

  const teacherLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'faculty@example.com', password: 'password123' }),
  })
  assert(teacherLogin.status === 200 && teacherLogin.data.data?.user?.role === 'teacher', 'Teacher login succeeds (role: teacher)')
  const teacherToken = teacherLogin.data.data?.token

  // 2. Role Security Check
  const studentCreateExam = await request('/exams', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      title: 'Illegal Student Exam',
      subject: 'Security',
      duration: 30,
      totalMarks: 10,
      numberOfQuestions: 5,
      startTime: new Date().toISOString(),
    }),
  })
  assert(studentCreateExam.status === 403, 'Student blocked from creating exam (HTTP 403 Forbidden)')

  // 3. Admin Create Exam
  const createExamRes = await request('/exams', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'Automated Test Exam',
      subject: 'Software Engineering',
      description: 'Test exam created by automated suite',
      instructions: 'Answer all questions',
      duration: 25,
      totalMarks: 0,
      numberOfQuestions: 0,
      startTime: new Date(Date.now() - 60000).toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
    }),
  })
  assert(createExamRes.status === 201 && createExamRes.data.data?._id, 'Admin successfully created exam (HTTP 201 Created)')
  const examId = createExamRes.data.data?._id

  // 4. Admin Add Questions & Exam Stats Sync
  const q1Res = await request(`/exams/${examId}/questions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      questionText: 'What is the primary key in a database table?',
      options: ['A unique identifier', 'A nullable foreign reference', 'An index for sorting only', 'A stored procedure'],
      correctAnswer: 0,
      marks: 2,
      questionOrder: 1,
    }),
  })
  assert(q1Res.status === 201 && q1Res.data.data?._id, 'Admin created Question 1 (HTTP 201 Created)')
  const q1Id = q1Res.data.data?._id

  const q2Res = await request(`/exams/${examId}/questions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      questionText: 'Which HTTP method is idempotent?',
      options: ['POST', 'GET', 'PATCH', 'CONNECT'],
      correctAnswer: 1,
      marks: 3,
      questionOrder: 2,
    }),
  })
  assert(q2Res.status === 201, 'Admin created Question 2 (HTTP 201 Created)')
  const q2Id = q2Res.data.data?._id

  // Verify Exam Stats auto-synchronized
  const updatedExam = await request(`/exams/${examId}`)
  assert(
    updatedExam.status === 200 &&
    updatedExam.data.data?.numberOfQuestions === 2 &&
    updatedExam.data.data?.totalMarks === 5,
    'Exam question count and total marks auto-synchronized in MongoDB (2 questions, 5 marks)'
  )

  // 5. Correct Answer Exposure Security Check
  const adminQuestions = await request(`/exams/${examId}/questions`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  assert(
    adminQuestions.status === 200 && adminQuestions.data.data[0]?.correctAnswer !== undefined,
    'Admin/Teacher receives correctAnswer in question list for management'
  )

  const studentQuestions = await request(`/exams/${examId}/questions`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  })
  assert(
    studentQuestions.status === 200 && studentQuestions.data.data[0]?.correctAnswer === undefined,
    'Student question list has correctAnswer stripped (secure toPublicJSON)'
  )

  // 6. Teacher Edit Question
  const editQRes = await request(`/questions/${q1Id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: JSON.stringify({
      marks: 4,
    }),
  })
  assert(editQRes.status === 200 && editQRes.data.data?.marks === 4, 'Teacher updated question marks to 4 (HTTP 200 OK)')

  // Verify Exam totalMarks re-synced
  const resyncedExam = await request(`/exams/${examId}`)
  assert(resyncedExam.data.data?.totalMarks === 7, 'Exam totalMarks auto-resynced after question edit (4 + 3 = 7 marks)')

  // 7. Student Exam Attempt & Server Scoring
  const attemptRes = await request(`/exams/${examId}/attempts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      answers: {
        [q1Id]: 0, // Correct (4 marks)
        [q2Id]: 0, // Incorrect (0 marks, correct was 1)
      },
    }),
  })
  assert(
    attemptRes.status === 201 &&
    attemptRes.data.data?.score === 4 &&
    attemptRes.data.data?.totalMarks === 7,
    'Student completed and submitted attempt; server evaluated score accurately (4/7 marks)'
  )

  // 8. Teacher/Admin Platform Activity
  const allResultsAdmin = await request('/results/all', {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  assert(
    allResultsAdmin.status === 200 && Array.isArray(allResultsAdmin.data.data) && allResultsAdmin.data.data.length > 0,
    'Admin successfully accessed platform results feed (HTTP 200 OK)'
  )

  const studentAllResults = await request('/results/all', {
    headers: { Authorization: `Bearer ${studentToken}` },
  })
  assert(studentAllResults.status === 403, 'Student blocked from accessing /results/all (HTTP 403 Forbidden)')

  // 9. Admin Cascading Deletion
  const deleteExamRes = await request(`/exams/${examId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  assert(deleteExamRes.status === 200, 'Admin deleted exam (HTTP 200 OK)')

  const verifyExamGone = await request(`/exams/${examId}`)
  assert(verifyExamGone.status === 404, 'Exam is deleted (HTTP 404)')

  const verifyQuestionsGone = await request(`/exams/${examId}/questions`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  assert(verifyQuestionsGone.status === 404, 'Cascaded deletion confirmed: Questions for deleted exam removed')

  console.log(`\n=== Verification Results: ${passed} passed, ${failed} failed ===\n`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((err) => {
  console.error('Test execution error:', err)
  process.exit(1)
})
