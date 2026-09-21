import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    // Absent entirely for Google-only accounts — never sent to the
    // frontend regardless (see toSafeJSON below and select:false).
    passwordHash: {
      type: String,
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student', // signup can never set anything else — see authController
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return
  const salt = await bcrypt.genSalt(10)
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
})

userSchema.methods.comparePassword = function (candidate) {
  if (!this.passwordHash) return Promise.resolve(false)
  return bcrypt.compare(candidate, this.passwordHash)
}

// The only shape of a user that should ever reach the frontend.
userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    profileImage: this.profileImage,
    provider: this.provider,
    role: this.role,
    createdAt: this.createdAt,
  }
}

export const User = mongoose.model('User', userSchema)
