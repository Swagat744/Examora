import { apiRequest } from './apiClient'

export function register({ name, email, password, confirmPassword }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword }),
  })
}

export function login({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// idToken comes from Firebase's Google popup flow (see googleAuth.js) —
// the backend independently re-verifies it against Google before
// trusting anything in it.
export function googleAuth(idToken) {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
}

export function getMe() {
  return apiRequest('/auth/me')
}

export function updateMe(payload) {
  return apiRequest('/auth/me', { method: 'PUT', body: JSON.stringify(payload) })
}
