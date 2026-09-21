import { apiRequest } from './apiClient'

// GET /exams/:examId/questions — teacher/admin receives full questions including correctAnswer
export function getQuestionsForExam(examId) {
  return apiRequest(`/exams/${examId}/questions`)
}

// GET /questions/:id — single question with correctAnswer
export function getQuestionById(id) {
  return apiRequest(`/questions/${id}`)
}

// POST /exams/:examId/questions — creates a new question and syncs exam stats
export function createQuestion(examId, payload) {
  return apiRequest(`/exams/${examId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// PUT /questions/:id — updates an existing question
export function updateQuestion(id, payload) {
  return apiRequest(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

// DELETE /questions/:id — deletes a question and syncs exam stats
export function deleteQuestion(id) {
  return apiRequest(`/questions/${id}`, {
    method: 'DELETE',
  })
}
