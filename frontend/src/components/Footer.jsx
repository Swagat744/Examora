import Logo from './Logo'

const columns = [
  {
    title: 'ARCHITECTURE',
    links: ['REST API Specification', 'Socket.IO Real-time Sync', 'MongoDB Atlas Schema', 'Dockerized Engine'],
  },
  {
    title: 'ACADEMIC ROLES',
    links: ['Student Examination Interface', 'Faculty Question Editor', 'Dean & Administrator Approvals', 'Automated Grading Key'],
  },
  {
    title: 'SECURITY & PROTOCOL',
    links: ['JWT Bearer Auth', 'Mass-Assignment Protection', 'Dual Rate Limiting', 'Question Edit Lockout'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t-2 border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-xs font-mono leading-relaxed text-muted">
              Standardized online examination infrastructure for educational institutions, faculty, and candidates.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-teal" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="font-mono text-xs text-muted">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t-2 border-line/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">&copy; {new Date().getFullYear()} EXAMORA PLATFORM // ALL RIGHTS RESERVED.</p>
          <p className="font-mono text-[11px] font-semibold text-ink">
            PRODUCTION AUDITED &middot; FULL STACK DEVELOPMENT EXPERIMENTS 1–10
          </p>
        </div>
      </div>
    </footer>
  )
}
