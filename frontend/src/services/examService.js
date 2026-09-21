import { apiRequest } from './apiClient'

// Maps the backend's lowercase workflow statuses onto the display labels
// the existing Tailwind UI (ExamCard, StatusPill, dashboard tabs) already
// knows how to render — keeps Practical 1's components untouched.
const STATUS_DISPLAY_MAP = {
  draft: 'Upcoming',
  scheduled: 'Upcoming',
  active: 'Available',
  completed: 'Completed',
  archived: 'Completed',
}

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

// Converts one backend Question document (already stripped of
// correctAnswer by the API) into the shape QuestionCard/QuestionNavigator
// already expect.
function normalizeQuestion(doc) {
  return {
    id: doc._id,
    text: doc.questionText,
    options: doc.options,
    marks: doc.marks,
  }
}

// Converts one backend Exam document into a normalized object that provides
// both the Student UI fields (date, time, status) and Admin UI fields (rawStatus, description, startTime, etc.)
function normalizeExam(doc) {
  return {
    id: doc._id,
    _id: doc._id,
    title: doc.title,
    subject: doc.subject,
    description: doc.description || '',
    instructions: doc.instructions || '',
    date: formatDate(doc.startTime),
    time: formatTime(doc.startTime),
    startTime: doc.startTime,
    endTime: doc.endTime,
    duration: doc.duration,
    questions: doc.numberOfQuestions,
    numberOfQuestions: doc.numberOfQuestions,
    marks: doc.totalMarks,
    totalMarks: doc.totalMarks,
    status: STATUS_DISPLAY_MAP[doc.status] || 'Upcoming',
    rawStatus: doc.status || 'draft',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export async function getExams() {
  const data = await apiRequest('/exams')
  return data.map(normalizeExam)
}

export async function getExamById(id) {
  const data = await apiRequest(`/exams/${id}`)
  return normalizeExam(data)
}

export function createExam(payload) {
  return apiRequest('/exams', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateExam(id, payload) {
  return apiRequest(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteExam(id) {
  return apiRequest(`/exams/${id}`, { method: 'DELETE' })
}

// Fetch all student attempt results for admin dashboard activity
export function getRecentResults() {
  return apiRequest('/results/all')
}

// Questions are returned pre-stripped of correctAnswer by the backend
// (Question.toPublicJSON) — this is a protected route, requires a token.
export async function getQuestionsForExam(examId) {
  const data = await apiRequest(`/exams/${examId}/questions`)
  return data.map(normalizeQuestion)
}
