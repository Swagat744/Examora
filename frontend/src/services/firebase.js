import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase is used ONLY to drive the "Continue with Google" popup — it
// is not Examora's session/auth system. The ID token it returns is sent
// to our own backend, which independently re-verifies it and issues our
// own JWT (see services/authService.js googleAuth + redux authSlice).
// This keeps Examora on a single authentication architecture (JWT)
// instead of running two systems in parallel.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
