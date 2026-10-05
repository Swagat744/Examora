// Normalize API_URL so that whether VITE_API_URL is configured with or without
// the trailing /api (e.g. on Render), it always correctly resolves to the /api namespace.
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '')
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`

const TOKEN_KEY = 'examora_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Every API call goes through here so the Bearer token — when one exists
// — is attached automatically. Public routes ignore the extra header;
// protected routes require it. Components never handle tokens directly.
export async function apiRequest(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  let body
  try {
    body = await res.json()
  } catch {
    throw new Error('Unable to reach the Examora API')
  }

  if (!res.ok || body.success === false) {
    throw new Error(body.message || 'Something went wrong')
  }

  return body.data
}
