import { apiRequest } from './apiClient'

// 40% is an assumed pass threshold — the exam/question models don't
// define one, so this is a reasonable default rather than a
// backend-confirmed rule. Surfaced here, in one place, if it ever needs
// to change or become exam-configurable.
const PASS_THRESHOLD = 40

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Adapts a backend Attempt document (with populated exam) into the shape
// ResultCard already expects, the same normalization pattern examService
// uses for Exam documents.
export function normalizeAttempt(doc) {
  return {
    id: doc._id,
    exam: doc.exam?.title || 'Examination',
    date: formatDate(doc.submittedAt),
    score: doc.score,
    total: doc.totalMarks,
    percentage: doc.percentage,
    status: doc.percentage >= PASS_THRESHOLD ? 'Pass' : 'Fail',
    correctCount: doc.correctCount,
    incorrectCount: doc.incorrectCount,
    unansweredCount: doc.unansweredCount,
  }
}

// answers: { [questionId]: selectedOptionIndex } — the student's picks
// only. Scoring happens entirely server-side against the real
// correctAnswer values; nothing about correctness is computed here.
export function submitAttempt(examId, { answers, startedAt }) {
  return apiRequest(`/exams/${examId}/attempts`, {
    method: 'POST',
    body: JSON.stringify({ answers, startedAt }),
  })
}

export async function getMyResults() {
  const data = await apiRequest('/results')
  return data.map(normalizeAttempt)
}

export async function getResultById(id) {
  const data = await apiRequest(`/results/${id}`)
  return normalizeAttempt(data)
}
