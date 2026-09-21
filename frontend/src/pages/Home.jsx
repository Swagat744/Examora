import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ArrowRight, CircleDot } from 'lucide-react'
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
      <div
        className="bubble-grid pointer-events-none absolute -right-6 -top-8 h-40 w-40 text-teal opacity-[0.12] sm:h-52 sm:w-52"
        aria-hidden="true"
      />
      <div className="relative rounded-3xl border border-line bg-paper-raised p-5 shadow-[0_24px_60px_-24px_rgba(20,33,61,0.25)] sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">DBMS Examination</p>
            <p className="mt-1 font-display text-base font-semibold text-ink">Question 7 of 20</p>
          </div>
          <div className="rounded-lg bg-ink px-3 py-1.5 font-mono text-lg font-semibold tabular-nums text-paper">
            {mm}:{ss}
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink-soft sm:text-base">
          Which normal form removes partial dependency on a candidate key?
        </p>

        <div className="mt-4 flex flex-col gap-2.5">
          {['First Normal Form', 'Second Normal Form', 'Third Normal Form'].map((opt, i) => (
            <div
              key={opt}
              className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                i === 1 ? 'border-teal bg-teal-soft text-ink' : 'border-line text-ink-soft'
              }`}
            >
              <CircleDot
                size={16}
                className={i === 1 ? 'text-teal' : 'text-muted'}
                fill={i === 1 ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
              {opt}
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i < 6 ? 'bg-teal' : 'bg-line'}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-muted">6 of 20 answered</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const ctaTarget = isAuthenticated ? '/student' : '/signup'

  return (
    <div>
      <Navbar />

      <main>
        {/* Hero */}
        <section id="home" className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pb-24 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-raised px-3 py-1 text-xs font-medium text-muted">
                Online Examination Platform
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                Smarter exams.
                <br />
                Better results.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
                Examora provides a modern platform for creating, conducting and evaluating online examinations.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="primary" size="lg" to={ctaTarget}>
                  Get Started <ArrowRight size={17} aria-hidden="true" />
                </Button>
                <Button variant="outline" size="lg" href="#features">
                  Explore Features
                </Button>
              </div>
            </div>

            <HeroExamPreview />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-line bg-paper-raised/50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Everything an exam needs
              </h2>
              <p className="mt-3 text-muted">
                A focused set of tools for running examinations end to end — nothing you won't use.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <FeatureCard key={f.id} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                How it works
              </h2>
              <p className="mt-3 text-muted">From question bank to result, in four steps.</p>
            </div>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, i) => (
                <li
                  key={step.id}
                  className="relative rounded-2xl border border-line bg-paper-raised p-6"
                >
                  <span className="font-mono text-xs font-semibold text-teal">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
