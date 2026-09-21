import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { registerUser, loginWithGoogle, clearAuthError } from '../redux/slices/authSlice'

const inputClass =
  'focus-ring w-full rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-muted'

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [formError, setFormError] = useState('')

  const isSubmitting = status === 'loading'

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearAuthError())

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError('')

    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      navigate('/student', { replace: true })
    }
  }

  const handleGoogle = async () => {
    dispatch(clearAuthError())
    const result = await dispatch(loginWithGoogle())
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate('/student', { replace: true })
    }
  }

  const displayError = formError || error

  return (
    <div>
      <Navbar />

      <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-14 sm:px-8">
        <div className="rounded-3xl border border-line bg-paper-raised p-6 sm:p-9">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Create your Examora account</h1>
          <p className="mt-1.5 text-sm text-muted">Set up an account to start taking examinations.</p>

          {displayError && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-coral/30 bg-coral-soft p-3 text-sm text-coral">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{displayError}</span>
            </div>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-soft">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Swagat Patil"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-soft">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-soft">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink-soft">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-line" />
            OR
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogle}
            disabled={isSubmitting}
          >
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="focus-ring rounded-sm font-medium text-teal">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
