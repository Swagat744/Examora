import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ArrowRight, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import FeatureCard from '../components/FeatureCard'
import { features, howItWorks } from '../data/mockData'

function HeroExamPreview() {
  const [seconds, setSeconds] = useState(24 * 60 + 37)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="relative">
      {/* Neo-brutalist offset backing */}
      <div className="absolute -bottom-3 -right-3 h-full w-full rounded-xl border-2 border-line bg-cobalt" />

      <div className="neo-card relative p-6 sm:p-7">
        <div className="flex items-center justify-between border-b-2 border-line/10 pb-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cobalt">
              SPECIMEN // DBMS ASSESSMENT
            </span>
            <p className="font-display text-base font-bold text-ink">Candidate Exam Terminal</p>
          </div>
          <div className="rounded border-2 border-line bg-ink px-3 py-1 font-mono text-base font-bold tabular-nums text-paper shadow-[2px_2px_0px_var(--color-line)]">
            {mm}:{ss}
          </div>
        </div>

        <p className="mt-5 text-sm font-medium leading-relaxed text-ink sm:text-base">
          Which normal form removes partial functional dependency on a composite primary key?
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {[
            { label: 'First Normal Form (1NF)', active: false },
            { label: 'Second Normal Form (2NF)', active: true },
            { label: 'Third Normal Form (3NF)', active: false },
          ].map((opt, i) => (
            <div
              key={opt.label}
              className={`flex items-center gap-3 rounded-lg border-2 p-3 text-xs sm:text-sm font-medium transition-all ${
                opt.active
                  ? 'border-line bg-cobalt text-white shadow-[2px_2px_0px_var(--color-line)]'
                  : 'border-line/40 bg-paper text-ink-soft'
              }`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded border font-mono text-[10px] font-bold ${
                  opt.active
                    ? 'border-white bg-white text-cobalt'
                    : 'border-line bg-paper-raised text-muted'
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt.label}</span>
              {opt.active && <Check size={14} className="stroke-[3]" />}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t-2 border-line/10 pt-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded border border-line ${
                  i < 5 ? 'bg-teal' : 'bg-paper'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs font-semibold text-muted">05 OF 08 RECORDED</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dashboardTarget = user?.role === 'student' ? '/student' : '/admin'
  const ctaTarget = isAuthenticated ? dashboardTarget : '/signup'

  return (
    <div className="min-h-screen bg-paper swiss-grid-pattern">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="home" className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded border-2 border-line bg-paper-raised px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0px_var(--color-line)]">
                <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                ACADEMIC EXAMINATION SUITE // V2.0
              </div>

              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
                Precision Testing.
                <br />
                <span className="text-cobalt">Zero Compromise.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
                Examora provides high-integrity online examination infrastructure. Engineered with strict server-side evaluation, tamper-resistant timers, and real-time candidate synchronization.
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Button variant="accent" size="lg" to={ctaTarget}>
                  {isAuthenticated ? 'ACCESS DASHBOARD' : 'START AS CANDIDATE'}
                  <ArrowRight size={17} aria-hidden="true" />
                </Button>
                <Button variant="outline" size="lg" to="/login">
                  FACULTY PORTAL
                </Button>
              </div>

              {/* Swiss Spec Row */}
              <div className="mt-10 grid grid-cols-3 gap-3 border-t-2 border-line/10 pt-6">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">GRADING LATENCY</p>
                  <p className="mt-1 font-mono text-base font-bold text-ink">&lt; 15 ms</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">SOCKET PROTOCOL</p>
                  <p className="mt-1 font-mono text-base font-bold text-ink">WSS + JWT</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">DATA INTEGRITY</p>
                  <p className="mt-1 font-mono text-base font-bold text-ink">LOCKOUT V2</p>
                </div>
              </div>
            </div>

            <HeroExamPreview />
          </div>
        </section>

        {/* Swiss Grid Capabilities */}
        <section id="features" className="border-t-2 border-line bg-paper-raised py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                  SECTION 01 // PLATFORM CAPABILITIES
                </span>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Enterprise Academic Infrastructure
                </h2>
              </div>
              <p className="max-w-md text-sm text-muted">
                Each module is strictly decoupled, role-gated, and audited across database constraints.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <FeatureCard key={f.id} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* Architectural Workflow Sequence */}
        <section id="how-it-works" className="border-t-2 border-line bg-paper py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-xl">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                SECTION 02 // WORKFLOW SEQUENCE
              </span>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                The Examination Lifecycle
              </h2>
              <p className="mt-2 text-sm text-muted">
                How Examora ensures cryptographic answer privacy and consistent attempt evaluation.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {howItWorks.map((step, idx) => (
                <div key={step.id} className="neo-card p-6">
                  <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
                    <span className="font-mono text-xs font-bold text-muted">STEP 0{idx + 1}</span>
                    <span className="h-2 w-2 rounded-full bg-ink" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Swiss Call to Action Banner */}
        <section className="border-t-2 border-line bg-ink py-16 text-paper">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal">
                  DEPLOYMENT AUDITED // READY FOR FACULTY EVALUATION
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
                  Ready to conduct or attempt examinations?
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" to={ctaTarget}>
                  LAUNCH PLATFORM <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
