import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { firebaseAuth } from './firebase'

const provider = new GoogleAuthProvider()

// Returns the Google-issued ID token (NOT a Firebase ID token) — this is
// the value google-auth-library verifies server-side against Google's
// own servers in authController.googleAuth.
export async function signInWithGooglePopup() {
  const result = await signInWithPopup(firebaseAuth, provider)
  const credential = GoogleAuthProvider.credentialFromResult(result)

  if (!credential?.idToken) {
    throw new Error('Google sign-in did not return a credential')
  }

  return credential.idToken
}
