import { useEffect, useState, useMemo } from 'react'
import { AlertCircle, FileText, Search } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ResultCard from '../components/ResultCard'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import { studentSidebarLinks } from '../data/sidebarLinks'
import { getMyResults } from '../services/resultService'

export default function Results() {
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')

  const loadData = () => {
    setStatus('loading')
    getMyResults()
      .then((data) => {
        setResults(data || [])
        setStatus('succeeded')
      })
      .catch(() => setStatus('failed'))
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return results
    const q = search.toLowerCase()
    return results.filter((r) => {
      const title = typeof r.exam === 'object' ? r.exam?.title : r.exam || ''
      const subject = typeof r.exam === 'object' ? r.exam?.subject : ''
      return title.toLowerCase().includes(q) || subject.toLowerCase().includes(q)
    })
  }, [results, search])

  const stats = useMemo(() => {
    const total = results.length
    if (total === 0) return { total: 0, passed: 0, avg: 0 }
    const passed = results.filter((r) => (r.percentage || 0) >= 40).length
    const sum = results.reduce((acc, r) => acc + (r.percentage || 0), 0)
    return {
      total,
      passed,
      avg: Math.round(sum / total),
    }
  }, [results])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-paper swiss-grid-pattern">
      <Sidebar links={studentSidebarLinks} footerLabel="STUDENT_PORTAL // RESULTS" />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
          <div className="border-b-2 border-line/10 pb-5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
              ACADEMIC TRANSCRIPTS // EVALUATED
            </span>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Examination Results
            </h1>
            <p className="mt-1 text-xs text-muted">
              Authoritative records of your submitted attempts, graded directly against faculty answer keys.
            </p>
          </div>

          {/* Swiss Stats Bar */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Attempts" value={stats.total} subtext="Evaluated exams" />
            <StatCard label="Passed Papers" value={stats.passed} subtext=">= 40% percentage" />
            <StatCard label="Cumulative Grade" value={`${stats.avg}%`} subtext="Average score" />
          </div>

          {/* Search bar */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search results by subject or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus-ring w-full rounded-lg border-2 border-line bg-paper-raised pl-9 pr-3 py-1.5 font-sans text-xs font-medium text-ink placeholder:text-muted"
              />
            </div>

            <Button variant="outline" size="sm" onClick={loadData} className="self-start sm:self-auto">
              REFRESH
            </Button>
          </div>

          {/* Results List */}
          <div className="mt-6 flex flex-col gap-3.5">
            {status === 'loading' ? (
              <div className="neo-card p-8 text-center font-mono text-xs text-muted animate-pulse">
                RETRIEVING EVALUATED RECORDS…
              </div>
            ) : status === 'failed' ? (
              <div className="neo-card flex flex-col items-center gap-2 border-coral bg-coral-soft p-8 text-center">
                <AlertCircle size={22} className="text-coral" aria-hidden="true" />
                <p className="font-display text-sm font-bold text-ink">Unable to fetch records</p>
                <Button variant="outline" size="sm" onClick={loadData}>
                  Try Again
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="neo-card p-12 text-center">
                <FileText size={32} className="mx-auto text-muted" />
                <p className="mt-3 font-display text-base font-bold text-ink">
                  {search ? 'No matching result records found.' : 'You have not completed any examinations yet.'}
                </p>
                <p className="mt-1 font-mono text-xs text-muted">
                  Attempts appear here immediately after final submission.
                </p>
              </div>
            ) : (
              filtered.map((result) => (
                <ResultCard key={result._id || result.id} result={result} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
