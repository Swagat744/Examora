import { useState } from 'react'
import { Menu, X, Sun, Moon, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Logo from './Logo'
import Button from './Button'
import { useExamora } from '../context/ExamoraContext'

const links = [
  { label: 'Overview', href: '#home' },
  { label: 'Capabilities', href: '#features' },
  { label: 'Workflow', href: '#how-it-works' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useExamora()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const isHome = location.pathname === '/'

  const ThemeToggle = ({ size }) => (
    <button
      type="button"
      onClick={toggleTheme}
      className="focus-ring neo-btn-press inline-flex items-center justify-center rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-paper"
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? <Moon size={size} /> : <Sun size={size} />}
    </button>
  )

  return (
    <header className="sticky top-0 z-50 border-b-2 border-line bg-paper-raised/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="focus-ring rounded">
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

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle size={16} />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={user?.role === 'student' ? '/student' : '/admin'}
                className="focus-ring neo-btn-press inline-flex items-center gap-1.5 rounded-lg border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper-raised"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="focus-ring neo-btn-press flex items-center gap-2 rounded-lg border-2 border-line bg-paper-raised px-3 py-1.5 font-mono text-xs font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper"
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-5 w-5 rounded-full object-cover border border-line" />
                ) : (
                  <span className="grid h-5 w-5 place-items-center rounded bg-cobalt-soft text-cobalt">
                    <User size={12} aria-hidden="true" />
                  </span>
                )}
                <span>{user?.name?.split(' ')[0]}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" to="/login">LOG IN</Button>
              <Button variant="accent" size="sm" to="/signup">REGISTER</Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle size={17} />
          <button
            type="button"
            className="focus-ring neo-btn-press rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t-2 border-line bg-paper-raised p-5 md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile">
            {isHome &&
              links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border-2 border-transparent p-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-line hover:bg-paper"
                >
                  {link.label}
                </a>
              ))}
            <div className="mt-3 flex flex-col gap-2 border-t-2 border-line/10 pt-3">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" size="sm" to={user?.role === 'student' ? '/student' : '/admin'} onClick={() => setOpen(false)}>
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" size="sm" to="/profile" onClick={() => setOpen(false)}>
                    Profile Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" to="/login" onClick={() => setOpen(false)}>
                    LOG IN
                  </Button>
                  <Button variant="accent" size="sm" to="/signup" onClick={() => setOpen(false)}>
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
