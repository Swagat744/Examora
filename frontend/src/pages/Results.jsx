import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ResultCard from '../components/ResultCard'
import { studentSidebarLinks } from '../data/sidebarLinks'
import { getMyResults } from '../services/resultService'

export default function Results() {
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    getMyResults()
      .then((data) => {
        if (!cancelled) {
          setResults(data)
          setStatus('succeeded')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('failed')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={studentSidebarLinks} footerLabel="Signed in as Student" />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">My Results</h1>
          <p className="mt-1 text-muted">Every examination you've submitted, scored from the real answer key.</p>

          <div className="mt-7 flex flex-col gap-3">
            {status === 'loading' ? (
              <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
                Loading results…
              </p>
            ) : status === 'failed' ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-coral/40 bg-coral-soft/40 p-8 text-center">
                <AlertCircle size={20} className="text-coral" aria-hidden="true" />
                <p className="text-sm font-medium text-ink">Unable to load results. Please try again.</p>
              </div>
            ) : results.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
                You haven't attempted any examinations yet.
              </p>
            ) : (
              results.map((result) => <ResultCard key={result.id} result={result} />)
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
