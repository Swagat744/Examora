import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Menu, X, Sun, Moon } from 'lucide-react'
import Logo from './Logo'
import { useExamora } from '../context/ExamoraContext'

export default function Sidebar({ links, footerLabel }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { theme, toggleTheme } = useExamora()

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
            className={`focus-ring neo-btn-press flex items-center justify-between rounded-lg border-2 p-3 text-left font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              isActive
                ? 'border-line bg-ink text-paper shadow-[3px_3px_0px_var(--color-line)]'
                : 'border-transparent text-ink hover:border-line/40 hover:bg-paper'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="flex items-center gap-3">
              <Icon size={16} aria-hidden="true" />
              <span>{link.label}</span>
            </div>
            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-paper" />}
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-line bg-paper-raised px-5 py-3 lg:hidden">
        <Link to="/" className="focus-ring">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring neo-btn-press rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)]"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            type="button"
            className="focus-ring neo-btn-press rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)]"
            aria-label="Open dashboard navigation"
            onClick={() => setOpen(true)}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-xs" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r-2 border-line bg-paper-raised p-5 shadow-[4px_0px_0px_var(--color-line)]">
            <div className="mb-6 flex items-center justify-between border-b-2 border-line/10 pb-4">
              <Logo />
              <button
                type="button"
                className="focus-ring rounded-lg border-2 border-line p-1.5 text-ink hover:bg-paper"
                aria-label="Close dashboard navigation"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            {footerLabel && (
              <div className="mt-auto border-t-2 border-line/10 pt-4">
                <span className="inline-block rounded border border-line bg-paper px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                  {footerLabel}
                </span>
              </div>
            )}
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
              className="focus-ring neo-btn-press inline-flex items-center justify-center rounded-lg border-2 border-line bg-paper p-1.5 text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper-raised"
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
