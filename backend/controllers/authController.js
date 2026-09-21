import { OAuth2Client } from 'google-auth-library'
import { User } from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' })
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' })
  }

  // role is never read from req.body — every signup is a student,
  // regardless of what the request contains.
  const user = await User.create({
    name,
    email,
    passwordHash: password, // hashed by the pre-save hook on User
    provider: 'local',
    role: 'student',
  })

  const token = generateToken(user._id)
  res.status(201).json({ success: true, data: { user: user.toSafeJSON(), token } })
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')

  // Same message whether the email doesn't exist or the password is
  // wrong — don't help an attacker enumerate registered emails.
  if (!user || user.provider !== 'local' || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const token = generateToken(user._id)
  res.status(200).json({ success: true, data: { user: user.toSafeJSON(), token } })
})

// POST /api/auth/google
// Body: { idToken } — the raw Google ID token obtained on the frontend
// via Firebase's GoogleAuthProvider (see src/services/googleAuth.js).
// Verified here against Google's servers; never trusted as-is.
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Missing Google ID token' })
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({
      success: false,
      message: 'Google sign-in is not configured on this server (GOOGLE_CLIENT_ID missing)',
    })
  }

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid Google credential' })
  }

  const { sub: googleId, email, name, picture, given_name, family_name } = payload

  const displayName =
    (typeof name === 'string' && name.trim()) ||
    [given_name, family_name].filter(Boolean).join(' ').trim() ||
    (email ? email.split('@')[0] : 'Examora Student')

  let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] })

  if (!user) {
    user = await User.create({
      name: displayName,
      email,
      profileImage: picture || '',
      provider: 'google',
      googleId,
      role: 'student',
    })
  } else if (!user.googleId) {
    // An account with this email already existed as a local account —
    // link the Google identity rather than creating a duplicate user.
    user.googleId = googleId
    user.provider = 'google'
    if (!user.name) user.name = displayName
    if (!user.profileImage && picture) user.profileImage = picture
    await user.save()
  }

  const token = generateToken(user._id)
  res.status(200).json({ success: true, data: { user: user.toSafeJSON(), token } })
})

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toSafeJSON() } })
})

// PUT /api/auth/me
export const updateMe = asyncHandler(async (req, res) => {
  const { name, profileImage } = req.body

  // Only name/profileImage are editable — role, email, provider, and id
  // are silently ignored even if present in the request body.
  if (typeof name === 'string' && name.trim()) req.user.name = name.trim()
  if (typeof profileImage === 'string') req.user.profileImage = profileImage

  await req.user.save()
  res.status(200).json({ success: true, data: { user: req.user.toSafeJSON() } })
})
