import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, CheckCircle2, GraduationCap, School, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { registerUser, loginWithGoogle, clearAuthError } from '../redux/slices/authSlice'

const inputClass =
  'focus-ring w-full rounded-lg border-2 border-line bg-paper px-3.5 py-2.5 font-sans text-sm font-medium text-ink placeholder:text-muted focus-visible:border-cobalt transition-colors'

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error } = useSelector((state) => state.auth)

  const [selectedRole, setSelectedRole] = useState('student') // 'student' | 'teacher'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [formError, setFormError] = useState('')
  const [facultySubmitted, setFacultySubmitted] = useState(false)

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

    const result = await dispatch(registerUser({ ...form, role: selectedRole }))
    if (registerUser.fulfilled.match(result)) {
      if (selectedRole === 'teacher' || result.payload?.data?.pendingApproval || result.payload?.pendingApproval) {
        setFacultySubmitted(true)
      } else {
        navigate('/student', { replace: true })
      }
    }
  }

  const handleGoogle = async () => {
    dispatch(clearAuthError())
    const result = await dispatch(loginWithGoogle('student'))
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate('/student', { replace: true })
    }
  }

  const displayError = formError || error

  return (
    <div className="min-h-screen bg-paper swiss-grid-pattern">
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 py-12 sm:px-8">
        <div className="neo-card p-6 sm:p-8 shadow-[5px_5px_0px_var(--color-line)]">
          {facultySubmitted ? (
            <div>
              <div className="flex items-center gap-3 border-b-2 border-line/10 pb-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-line bg-teal text-white shadow-[2px_2px_0px_var(--color-line)]">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal">
                    REGISTRATION PENDING REVIEW
                  </span>
                  <h1 className="font-display text-xl font-bold text-ink">
                    Faculty Account Created
                  </h1>
                </div>
              </div>

              <div className="mt-5 rounded-lg border-2 border-line bg-paper p-4 font-mono text-xs text-ink-soft leading-relaxed">
                Your request has been routed to the administrative verification queue. Once an administrator approves your faculty account, you will have clearance to schedule examinations and author questions.
              </div>

              <Button
                variant="accent"
                size="md"
                className="mt-6 w-full"
                onClick={() => navigate('/login')}
              >
                RETURN TO LOGIN
              </Button>
            </div>
          ) : (
            <>
              <div className="border-b-2 border-line/10 pb-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cobalt">
                  USER ONBOARDING // DOSSIER
                </span>
                <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                  Create Account
                </h1>
                <p className="mt-1 text-xs text-muted">
                  Register as an examination candidate or faculty member.
                </p>
              </div>

              {/* Role selector tabs */}
              <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border-2 border-line bg-paper p-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('student')
                    dispatch(clearAuthError())
                  }}
                  className={`flex items-center justify-center gap-2 rounded-md py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedRole === 'student'
                      ? 'border-2 border-line bg-ink text-paper shadow-[2px_2px_0px_var(--color-line)]'
                      : 'border-2 border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <GraduationCap size={15} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('teacher')
                    dispatch(clearAuthError())
                  }}
                  className={`flex items-center justify-center gap-2 rounded-md py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedRole === 'teacher'
                      ? 'border-2 border-line bg-ink text-paper shadow-[2px_2px_0px_var(--color-line)]'
                      : 'border-2 border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <School size={15} />
                  <span>Faculty</span>
                </button>
              </div>

              {selectedRole === 'teacher' && (
                <div className="mt-3.5 rounded-lg border-2 border-amber bg-amber-soft p-3 font-mono text-[11px] font-bold text-amber shadow-[2px_2px_0px_var(--color-amber)]">
                  NOTICE: Faculty registrations require manual administrator clearance before signing in.
                </div>
              )}

              {displayError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border-2 border-coral bg-coral-soft p-3 text-xs font-semibold text-coral shadow-[2px_2px_0px_var(--color-coral)]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{displayError}</span>
                </div>
              )}

              <form className="mt-5 flex flex-col gap-3.5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Full Legal Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Prof. Swagat Patil"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Institutional Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="candidate@university.edu"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="8+ characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                      Confirm
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="mt-2 w-full justify-between"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'ENROLLING USER…' : `REGISTER AS ${selectedRole.toUpperCase()}`}</span>
                  <ArrowRight size={16} />
                </Button>
              </form>

              {selectedRole === 'student' && (
                <>
                  <div className="my-5 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    <span className="h-0.5 flex-1 bg-line/20" />
                    OR CONNECT WITH
                    <span className="h-0.5 flex-1 bg-line/20" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={isSubmitting}
                    className="focus-ring neo-btn-press flex w-full items-center justify-center gap-3 rounded-lg border-2 border-line bg-paper-raised py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>SIGN UP WITH GOOGLE</span>
                  </button>
                </>
              )}

              <p className="mt-5 text-center font-mono text-xs text-muted">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-cobalt underline hover:text-ink">
                  Log in to portal
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
