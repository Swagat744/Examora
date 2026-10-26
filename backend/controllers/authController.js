import { OAuth2Client } from 'google-auth-library'
import { User } from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { asyncHandler } from '../utils/asyncHandler.js'

let googleClientInstance = null
function getGoogleClient() {
  if (!googleClientInstance && process.env.GOOGLE_CLIENT_ID) {
    googleClientInstance = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  }
  return googleClientInstance
}

// POST /api/auth/register
// Accepts an optional `role` field: 'student' (default) or 'teacher'.
// Faculty registrations create an unapproved teacher account that must
// be approved by an admin before gaining access to teacher functionality.
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role: requestedRole } = req.body

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

  // Only 'student' and 'teacher' are allowed from the registration form.
  // 'admin' can never be self-assigned — it requires direct database
  // promotion or the seed script.
  const isFacultyRequest = requestedRole === 'teacher'
  const role = isFacultyRequest ? 'teacher' : 'student'
  const isApproved = isFacultyRequest ? false : true

  const user = await User.create({
    name,
    email,
    passwordHash: password, // hashed by the pre-save hook on User
    provider: 'local',
    role,
    isApproved,
  })

  // Faculty accounts require admin approval before they can use teacher
  // features — return a success response but do NOT issue a login token.
  if (isFacultyRequest) {
    return res.status(201).json({
      success: true,
      message: 'Faculty registration submitted. Your account is pending admin approval.',
      data: { user: user.toSafeJSON(), pendingApproval: true },
    })
  }

  const token = generateToken(user._id)
  res.status(201).json({ success: true, data: { user: user.toSafeJSON(), token } })
})

// POST /api/auth/login
// Accepts an optional `selectedRole` from the frontend for role
// verification. The backend always derives authorization from the
// account's actual role — `selectedRole` is only used to give the user
// a clear error message if they pick the wrong tab.
export const login = asyncHandler(async (req, res) => {
  const { email, password, selectedRole } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')

  // Same message whether the email doesn't exist or the password is
  // wrong — don't help an attacker enumerate registered emails.
  if (!user || user.provider !== 'local' || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  // Role verification: if the frontend sent a selectedRole, check
  // whether it matches the account's actual role. This prevents a
  // student from accidentally reaching a faculty dashboard or vice versa.
  if (selectedRole) {
    const isStudentSelection = selectedRole === 'student'
    const isFacultySelection = selectedRole === 'teacher' || selectedRole === 'faculty'
    const actuallyStudent = user.role === 'student'
    const actuallyFaculty = user.role === 'teacher' || user.role === 'admin'

    if (isStudentSelection && !actuallyStudent) {
      return res.status(403).json({
        success: false,
        message: 'This account is registered as Faculty. Please use the Faculty login.',
      })
    }
    if (isFacultySelection && !actuallyFaculty) {
      return res.status(403).json({
        success: false,
        message: 'This account is registered as a Student. Please use the Student login.',
      })
    }
  }

  // Approval check: unapproved teachers cannot log in.
  if (user.role === 'teacher' && !user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your faculty account is pending admin approval. Please contact an administrator.',
    })
  }

  const token = generateToken(user._id)
  res.status(200).json({ success: true, data: { user: user.toSafeJSON(), token } })
})

// POST /api/auth/google
// Body: { idToken, selectedRole } — the raw Google ID token obtained on the frontend
// via Firebase's GoogleAuthProvider (see src/services/googleAuth.js).
// Verified here against Google's servers; never trusted as-is.
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, selectedRole } = req.body

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
    const client = getGoogleClient()
    const ticket = await client.verifyIdToken({
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
      isApproved: true,
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

  // Role verification for Google Sign-In
  if (selectedRole) {
    const isStudentSelection = selectedRole === 'student'
    const isFacultySelection = selectedRole === 'teacher' || selectedRole === 'faculty'
    const actuallyStudent = user.role === 'student'
    const actuallyFaculty = user.role === 'teacher' || user.role === 'admin'

    if (isStudentSelection && !actuallyStudent) {
      return res.status(403).json({
        success: false,
        message: 'This Google account is registered as Faculty. Please use the Faculty login.',
      })
    }
    if (isFacultySelection && !actuallyFaculty) {
      return res.status(403).json({
        success: false,
        message: 'This Google account is registered as a Student. Please use the Student login.',
      })
    }
  }

  // Approval check for Google-linked teacher accounts
  if (user.role === 'teacher' && !user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your faculty account is pending admin approval. Please contact an administrator.',
    })
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

// ── Faculty Approval Endpoints (admin only) ───────────────────────────

// GET /api/auth/pending-faculty
// Returns all teacher accounts with isApproved === false.
export const getPendingFaculty = asyncHandler(async (req, res) => {
  const pending = await User.find({ role: 'teacher', isApproved: false })
    .select('name email createdAt')
    .sort({ createdAt: -1 })

  res.status(200).json({ success: true, data: pending })
})

// PATCH /api/auth/approve-faculty/:id
// Approves a pending teacher account. Self-approval is prevented.
export const approveFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Prevent an admin from approving their own account (edge case: an
  // admin who also has a separate pending teacher account ID).
  if (String(req.user._id) === String(id)) {
    return res.status(403).json({ success: false, message: 'You cannot approve your own account' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  if (user.role !== 'teacher') {
    return res.status(400).json({ success: false, message: 'This user is not a faculty account' })
  }
  if (user.isApproved) {
    return res.status(400).json({ success: false, message: 'This faculty account is already approved' })
  }

  user.isApproved = true
  await user.save()

  res.status(200).json({
    success: true,
    message: `${user.name} has been approved as faculty.`,
    data: { ...user.toSafeJSON(), message: `${user.name} has been approved as faculty.` },
  })
})

// DELETE /api/auth/reject-faculty/:id
// Rejects (deletes) a pending teacher account. Cannot reject approved
// teachers or non-teacher accounts.
export const rejectFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  if (user.role !== 'teacher') {
    return res.status(400).json({ success: false, message: 'This user is not a faculty account' })
  }
  if (user.isApproved) {
    return res.status(400).json({ success: false, message: 'Cannot reject an already-approved faculty account' })
  }

  await User.findByIdAndDelete(id)

  res.status(200).json({
    success: true,
    message: `Faculty registration for ${user.name} has been rejected.`,
    data: { id, name: user.name, message: `Faculty registration for ${user.name} has been rejected.` },
  })
})
