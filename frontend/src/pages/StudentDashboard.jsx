import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Search, AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import ExamCard from '../components/ExamCard'
import ResultCard from '../components/ResultCard'
import Button from '../components/Button'
import { studentSidebarLinks } from '../data/sidebarLinks'
import { setDashboardTab, setSearchQuery } from '../redux/slices/uiSlice'
import { fetchExams } from '../redux/slices/examSlice'
import { getMyResults } from '../services/resultService'

const tabs = ['All', 'Available', 'Upcoming', 'Completed']

export default function StudentDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  // Dashboard tab and search query live in Redux's uiSlice (Practical 3) —
  // unchanged here.
  const tab = useSelector((state) => state.ui.activeDashboardTab)
  const searchQuery = useSelector((state) => state.ui.searchQuery)

  // Exam list comes from the real backend via the fetchExams thunk
  // (Practical 4). examsStatus drives the loading/empty/error UI.
  const examsData = useSelector((state) => state.exam.exams)
  const examsStatus = useSelector((state) => state.exam.examsStatus)
  const examsError = useSelector((state) => state.exam.examsError)

  // Recent results now come from the authenticated student's real
  // attempts (Attempt collection) rather than the old mock array. This
  // is page-specific display data — like the exam-loading state before
  // it, it stays local rather than moving into Redux.
  const [results, setResults] = useState([])
  const [resultsStatus, setResultsStatus] = useState('loading')

  useEffect(() => {
    dispatch(fetchExams())
  }, [dispatch])

  useEffect(() => {
    let cancelled = false
    setResultsStatus('loading')
    getMyResults()
      .then((data) => {
        if (!cancelled) {
          setResults(data)
          setResultsStatus('succeeded')
        }
      })
      .catch(() => {
        if (!cancelled) setResultsStatus('failed')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Side effect with no cleanup needed — just synchronizing the browser
  // tab title with dashboard state, a classic useEffect use case.
  useEffect(() => {
    document.title = `Examora — ${tab} Exams`
  }, [tab])

  const stats = useMemo(
    () => [
      { id: 1, label: 'Available Exams', value: examsData.filter((e) => e.status === 'Available').length, tone: 'teal' },
      { id: 2, label: 'Upcoming Exams', value: examsData.filter((e) => e.status === 'Upcoming').length, tone: 'amber' },
      { id: 3, label: 'Completed Exams', value: examsData.filter((e) => e.status === 'Completed').length, tone: 'success' },
    ],
    [examsData],
  )

  const filteredExams = useMemo(() => {
    const byTab = tab === 'All' ? examsData : examsData.filter((e) => e.status === tab)
    const query = searchQuery.trim().toLowerCase()
    if (!query) return byTab
    return byTab.filter(
      (e) => e.title.toLowerCase().includes(query) || e.subject.toLowerCase().includes(query),
    )
  }, [examsData, tab, searchQuery])

  const isLoading = examsStatus === 'loading' || examsStatus === 'idle'
  const isError = examsStatus === 'failed'

  const averageScore = useMemo(() => {
    if (results.length === 0) return null
    const sum = results.reduce((acc, r) => acc + r.percentage, 0)
    return Math.round(sum / results.length)
  }, [results])

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={studentSidebarLinks} footerLabel="Signed in as Student" />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Good morning, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-muted">Your examination overview</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-line bg-paper-raised" />
                ))
              : stats.map((stat) => <StatCard key={stat.id} {...stat} />)}
          </div>

          <section className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">Exams</h2>
              <div role="tablist" aria-label="Filter exams" className="flex flex-wrap gap-1.5 rounded-full border border-line bg-paper-raised p-1">
                {tabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => dispatch(setDashboardTab(t))}
                    className={`focus-ring rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                      tab === t ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-4 max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search exams by title or subject"
                aria-label="Search exams"
                className="focus-ring w-full rounded-full border border-line bg-paper-raised py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                <p className="col-span-full rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
                  Loading examinations…
                </p>
              ) : isError ? (
                <div className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-dashed border-coral/40 bg-coral-soft/40 p-8 text-center">
                  <AlertCircle size={20} className="text-coral" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-ink">Unable to load examinations.</p>
                    <p className="mt-0.5 text-xs text-muted">{examsError || 'Please try again.'}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => dispatch(fetchExams())}>
                    Retry
                  </Button>
                </div>
              ) : filteredExams.length === 0 && examsData.length === 0 ? (
                <p className="col-span-full rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
                  No examinations available.
                </p>
              ) : (
                <>
                  {filteredExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                  {filteredExams.length === 0 && (
                    <p className="col-span-full rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
                      No exams match "{searchQuery}" in this category.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">Recent Results</h2>
              {averageScore !== null && (
                <p className="text-sm text-muted">
                  Average score: <span className="font-medium text-ink">{averageScore}%</span>
                </p>
              )}
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {resultsStatus === 'loading' ? (
                <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  Loading results…
                </p>
              ) : resultsStatus === 'failed' ? (
                <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  Unable to load results. Please try again.
                </p>
              ) : results.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  You haven't attempted any examinations yet.
                </p>
              ) : (
                results.slice(0, 5).map((result) => <ResultCard key={result.id} result={result} />)
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
