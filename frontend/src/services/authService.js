import { apiRequest } from './apiClient'

export function register({ name, email, password, confirmPassword, role = 'student' }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword, role }),
  })
}

export function login({ email, password, selectedRole }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, selectedRole }),
  })
}

// idToken comes from Firebase's Google popup flow (see googleAuth.js) —
// the backend independently re-verifies it against Google before
// trusting anything in it.
export function googleAuth(idToken, selectedRole) {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken, selectedRole }),
  })
}

export function getMe() {
  return apiRequest('/auth/me')
}

export function updateMe(payload) {
  return apiRequest('/auth/me', { method: 'PUT', body: JSON.stringify(payload) })
}

export function getPendingFaculty() {
  return apiRequest('/auth/pending-faculty')
}

export function approveFaculty(id) {
  return apiRequest(`/auth/approve-faculty/${id}`, { method: 'PATCH' })
}

export function rejectFaculty(id) {
  return apiRequest(`/auth/reject-faculty/${id}`, { method: 'DELETE' })
}
