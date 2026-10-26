import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, X, Sun, Moon, LogOut, User } from 'lucide-react'
import Logo from './Logo'
import { useExamora } from '../context/ExamoraContext'
import { logout } from '../redux/slices/authSlice'

export default function Sidebar({ links, footerLabel }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { theme, toggleTheme } = useExamora()

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Body scroll locking when drawer is open
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

  const visibleLinks = links.filter((link) => {
    if (link.adminOnly && user?.role !== 'admin') return false
    return true
  })

  const NavList = ({ onNavigate }) => (
    <nav className="flex flex-1 flex-col gap-2" aria-label="Dashboard navigation">
      {visibleLinks.map((link) => {
        const Icon = link.icon
        const isActive = location.pathname === link.to

        return (
          <button
            key={link.label}
            type="button"
            onClick={() => {
              navigate(link.to)
              onNavigate?.()
            }}
            className={`focus-ring neo-btn-press flex min-h-[44px] items-center justify-between rounded-lg border-2 px-3.5 py-2.5 text-left font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              isActive
                ? 'border-line bg-ink text-paper shadow-[3px_3px_0px_var(--color-line)]'
                : 'border-transparent text-ink hover:border-line/40 hover:bg-paper'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="flex items-center gap-3">
              <Icon size={17} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{link.label}</span>
            </div>
            {isActive && <span className="h-2 w-2 shrink-0 rounded-full bg-paper" />}
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex w-full shrink-0 items-center justify-between border-b-2 border-line bg-paper-raised px-4 py-2.5 sm:px-6 lg:hidden">
        <Link to="/" className="focus-ring" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring neo-btn-press inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)]"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            type="button"
            className="focus-ring neo-btn-press inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)]"
            aria-label={open ? 'Close dashboard navigation' : 'Open dashboard navigation'}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard Navigation">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r-2 border-line bg-paper-raised p-5 shadow-[4px_0px_0px_var(--color-line)] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between border-b-2 border-line/10 pb-4">
              <Logo />
              <button
                type="button"
                className="focus-ring inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border-2 border-line p-1.5 text-ink hover:bg-paper"
                aria-label="Close dashboard navigation"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Session info badge */}
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border-2 border-line bg-paper p-2.5 shadow-[2px_2px_0px_var(--color-line)]">
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
                <p className="truncate font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="font-mono text-[9px] font-semibold text-muted uppercase">
                  {user?.role || 'Guest'}
                </p>
              </div>
            </div>

            <NavList onNavigate={() => setOpen(false)} />

            {/* Mobile Drawer Footer with Logout & Theme */}
            <div className="mt-auto border-t-2 border-line/10 pt-4 flex flex-col gap-3">
              {footerLabel && (
                <span className="inline-block rounded border border-line bg-paper px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted text-center">
                  {footerLabel}
                </span>
              )}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="focus-ring neo-btn-press flex-1 flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border-2 border-coral bg-coral-soft px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-coral shadow-[2px_2px_0px_var(--color-coral)] hover:bg-coral hover:text-white"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="focus-ring neo-btn-press inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border-2 border-line bg-paper p-2 text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper-raised"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-line bg-paper-raised p-5 lg:flex">
        <div className="mb-6 border-b-2 border-line/10 pb-5">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <NavList />

        {/* Sidebar Footer with Theme Toggle & Session Info */}
        <div className="mt-auto border-t-2 border-line/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
                {user?.name?.split(' ')[0] || 'User'}
              </p>
              <p className="font-mono text-[10px] font-medium text-muted uppercase">
                {user?.role || 'Guest'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring neo-btn-press inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border-2 border-line bg-paper p-1.5 text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper-raised"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

