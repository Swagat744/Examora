import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, GraduationCap, School, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { loginUser, loginWithGoogle, clearAuthError } from '../redux/slices/authSlice'
import ExamBackground from '../components/ExamBackground'

const inputClass =
  'focus-ring w-full rounded-lg border-2 border-line bg-paper px-3.5 py-2.5 font-sans text-sm font-medium text-ink placeholder:text-muted focus-visible:border-cobalt transition-colors'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useSelector((state) => state.auth)

  const [selectedRole, setSelectedRole] = useState('student') // 'student' | 'teacher'
  const [form, setForm] = useState({ email: '', password: '' })

  const isSubmitting = status === 'loading'

  const getDestination = (loggedUser) => {
    if (location.state?.from) return location.state.from
    return ['admin', 'teacher'].includes(loggedUser?.role) ? '/admin' : '/student'
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearAuthError())
    const result = await dispatch(loginUser({ ...form, selectedRole }))
    if (loginUser.fulfilled.match(result)) {
      navigate(getDestination(result.payload?.user), { replace: true })
    }
  }

  const handleGoogle = async () => {
    dispatch(clearAuthError())
    const result = await dispatch(loginWithGoogle(selectedRole))
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate(getDestination(result.payload?.user), { replace: true })
    }
  }

  return (
    <div className="relative min-h-screen bg-paper swiss-grid-pattern overflow-hidden">
      <ExamBackground />
      <Navbar />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="neo-card p-5 sm:p-8 shadow-[5px_5px_0px_var(--color-line)] animate-card-entrance">
          <div className="border-b-2 border-line/10 pb-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cobalt">
              SECURITY ACCESS TERMINAL
            </span>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Account Login
            </h1>
            <p className="mt-1 text-xs text-muted">
              Authenticate your identity to access academic examination workspaces.
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
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-md py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
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
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-md py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                selectedRole === 'teacher'
                  ? 'border-2 border-line bg-ink text-paper shadow-[2px_2px_0px_var(--color-line)]'
                  : 'border-2 border-transparent text-muted hover:text-ink'
              }`}
            >
              <School size={15} />
              <span>Faculty</span>
            </button>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border-2 border-coral bg-coral-soft p-3 text-xs font-semibold text-coral shadow-[2px_2px_0px_var(--color-coral)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                Email Address
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
                placeholder="name@university.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  Security Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="mt-2 w-full justify-between"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'VERIFYING CREDENTIALS…' : `LOGIN AS ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
            <span className="h-0.5 flex-1 bg-line/20" />
            FEDERATED IDENTITY
            <span className="h-0.5 flex-1 bg-line/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={isSubmitting}
            className="focus-ring neo-btn-press flex w-full items-center justify-center gap-3 rounded-lg border-2 border-line bg-paper-raised py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>SIGN IN WITH GOOGLE</span>
          </button>

          <p className="mt-6 text-center font-mono text-xs text-muted">
            New candidate or instructor?{' '}
            <Link to="/signup" className="font-bold text-cobalt underline hover:text-ink">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
