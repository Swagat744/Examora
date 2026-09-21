import { useState } from 'react'
import { Menu, X, Sun, Moon, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Logo from './Logo'
import Button from './Button'
import { useExamora } from '../context/ExamoraContext'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#how-it-works' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useExamora()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const ThemeToggle = ({ size }) => (
    <button
      type="button"
      onClick={toggleTheme}
      className="focus-ring inline-flex items-center justify-center rounded-full border border-line p-2 text-ink-soft transition-colors hover:text-ink"
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? <Moon size={size} /> : <Sun size={size} />}
    </button>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="focus-ring rounded-sm">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="focus-ring rounded-sm text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle size={16} />
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="focus-ring flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm font-medium text-ink hover:border-ink/30"
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-soft text-teal">
                  <User size={13} aria-hidden="true" />
                </span>
              )}
              {user?.name?.split(' ')[0]}
            </Link>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login">Log In</Button>
              <Button variant="primary" size="sm" to="/signup">Sign Up</Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle size={18} />
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center rounded-md p-2 text-ink"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-paper-raised md:hidden">
          <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-md px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
              {isAuthenticated ? (
                <Button variant="outline" size="sm" to="/profile" onClick={() => setOpen(false)} className="w-full">
                  My Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" to="/login" onClick={() => setOpen(false)} className="w-full">
                    Log In
                  </Button>
                  <Button variant="primary" size="sm" to="/signup" onClick={() => setOpen(false)} className="w-full">
                    Sign Up
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
