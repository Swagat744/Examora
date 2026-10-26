import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon, User, LogOut, ArrowRight } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Logo from './Logo'
import Button from './Button'
import { useExamora } from '../context/ExamoraContext'
import { logout } from '../redux/slices/authSlice'

const links = [
  { label: 'Overview', href: '#home' },
  { label: 'Capabilities', href: '#features' },
  { label: 'Workflow', href: '#how-it-works' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useExamora()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const isHome = location.pathname === '/'

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Handle Escape key dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleLogout = () => {
    dispatch(logout())
    setOpen(false)
    navigate('/', { replace: true })
  }

  const ThemeToggle = ({ size, className = '' }) => (
    <button
      type="button"
      onClick={toggleTheme}
      className={`focus-ring neo-btn-press inline-flex min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] items-center justify-center rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-paper ${className}`}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? <Moon size={size} /> : <Sun size={size} />}
    </button>
  )

  const dashboardPath = user?.role === 'student' ? '/student' : '/admin'

  return (
    <header className="sticky top-0 z-50 border-b-2 border-line bg-paper-raised/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="focus-ring rounded shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {isHome && (
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="focus-ring font-mono text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle size={16} />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={dashboardPath}
                className="focus-ring neo-btn-press inline-flex items-center gap-1.5 rounded-lg border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper-raised"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="focus-ring neo-btn-press flex items-center gap-2 rounded-lg border-2 border-line bg-paper-raised px-3 py-1.5 font-mono text-xs font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover border border-line"
                  />
                ) : (
                  <span className="grid h-5 w-5 place-items-center rounded bg-cobalt-soft text-cobalt">
                    <User size={12} aria-hidden="true" />
                  </span>
                )}
                <span className="max-w-[110px] truncate">{user?.name?.split(' ')[0] || 'User'}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" to="/login">LOG IN</Button>
              <Button variant="accent" size="sm" to="/signup">REGISTER</Button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle size={17} />
          <button
            type="button"
            className="focus-ring neo-btn-press inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-2 border-line bg-paper-raised p-2.5 text-ink shadow-[2px_2px_0px_var(--color-line)]"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 z-50 border-b-2 border-line bg-paper-raised/98 shadow-[0_12px_0_rgba(18,24,38,0.15)] backdrop-blur-md md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <nav className="mx-auto max-w-lg p-5 flex flex-col gap-3" aria-label="Mobile Navigation">
            {/* Authenticated user badge */}
            {isAuthenticated && (
              <div className="flex items-center justify-between rounded-lg border-2 border-line bg-paper p-3 shadow-[2px_2px_0px_var(--color-line)] mb-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover border border-line shrink-0"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded bg-cobalt-soft text-cobalt shrink-0">
                      <User size={16} aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-ink">
                      {user?.name || 'Authorized User'}
                    </p>
                    <span className="inline-block rounded border border-line bg-paper-raised px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-cobalt">
                      ROLE: {user?.role || 'STUDENT'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation links */}
            {isHome ? (
              <div className="flex flex-col gap-1.5 border-b-2 border-line/10 pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted px-1">
                  SECTIONS
                </span>
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center justify-between rounded-lg border-2 border-transparent px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-line hover:bg-paper"
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={14} className="text-muted" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="border-b-2 border-line/10 pb-3">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center justify-between rounded-lg border-2 border-transparent px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-line hover:bg-paper"
                >
                  <span>&larr; Back to Platform Home</span>
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-1">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="accent"
                    size="md"
                    className="w-full justify-center min-h-[44px]"
                    to={dashboardPath}
                    onClick={() => setOpen(false)}
                  >
                    GO TO DASHBOARD
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center min-h-[44px]"
                    to="/profile"
                    onClick={() => setOpen(false)}
                  >
                    PROFILE SETTINGS
                  </Button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="focus-ring neo-btn-press flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 border-coral bg-coral-soft px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-coral shadow-[2px_2px_0px_var(--color-coral)] hover:bg-coral hover:text-white"
                  >
                    <LogOut size={15} />
                    <span>LOG OUT</span>
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center min-h-[44px]"
                    to="/login"
                    onClick={() => setOpen(false)}
                  >
                    LOG IN
                  </Button>
                  <Button
                    variant="accent"
                    size="md"
                    className="w-full justify-center min-h-[44px]"
                    to="/signup"
                    onClick={() => setOpen(false)}
                  >
                    REGISTER CANDIDATE
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

