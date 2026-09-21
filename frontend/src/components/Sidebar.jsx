import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

// `links` entries are { label, icon, to }. Active state is derived from
// the current route (useLocation), not a separately-tracked label, so
// highlighting never drifts out of sync with what's actually on screen —
// previously this component only called onSelect() and never navigated
// at all, which is exactly the "buttons that look interactive but do
// nothing" bug called out in the platform-improvement brief.
export default function Sidebar({ links, footerLabel }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const NavList = ({ onNavigate }) => (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard">
      {links.map((link) => {
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
            className={`focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={17} aria-hidden="true" />
            {link.label}
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper-raised px-5 py-3 lg:hidden">
        <Link to="/">
          <Logo />
        </Link>
        <button
          type="button"
          className="focus-ring rounded-md p-2 text-ink"
          aria-label="Open dashboard menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-paper-raised p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                className="focus-ring rounded-md p-1.5 text-ink"
                aria-label="Close dashboard menu"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            {footerLabel && <p className="mt-auto pt-4 text-xs text-muted">{footerLabel}</p>}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper-raised p-5 lg:flex">
        <Link to="/" className="mb-8">
          <Logo />
        </Link>
        <NavList />
        {footerLabel && <p className="mt-auto pt-4 text-xs text-muted">{footerLabel}</p>}
      </aside>
    </>
  )
}
