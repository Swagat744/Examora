import Logo from './Logo'

const columns = [
  {
    title: 'Product',
    links: ['Features', 'How it works', 'For teachers', 'For students'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Help center', 'Status', 'Privacy', 'Terms'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Create, conduct and evaluate examinations with ease.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold text-ink">{col.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-ink"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Examora. All rights reserved.</p>
          <p className="font-mono text-xs tracking-wide text-muted/80">Built for Semester 5 &middot; Full Stack Project</p>
        </div>
      </div>
    </footer>
  )
}
