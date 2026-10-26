import { useEffect, useMemo, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Search, AlertCircle, RefreshCw, Award, BookOpen } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import ExamCard from '../components/ExamCard'
import ResultCard from '../components/ResultCard'
import Button from '../components/Button'
import LiveIndicator from '../components/LiveIndicator'
import ExamNotificationToast from '../components/ExamNotificationToast'
import { studentSidebarLinks } from '../data/sidebarLinks'
import { setDashboardTab, setSearchQuery } from '../redux/slices/uiSlice'
import { fetchExams } from '../redux/slices/examSlice'
import { getMyResults } from '../services/resultService'
import { subscribeToExamPublished } from '../services/socketService'

const tabs = ['All', 'Available', 'Upcoming', 'Completed']

export default function StudentDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const tab = useSelector((state) => state.ui.activeDashboardTab)
  const searchQuery = useSelector((state) => state.ui.searchQuery)

  const examsData = useSelector((state) => state.exam.exams)
  const examsStatus = useSelector((state) => state.exam.examsStatus)
  const examsError = useSelector((state) => state.exam.examsError)

  const [results, setResults] = useState([])
  const [resultsStatus, setResultsStatus] = useState('loading')
  const [notification, setNotification] = useState(null)

  const loadExams = useCallback(() => {
    dispatch(fetchExams())
  }, [dispatch])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  // Real-time subscription to exam:published events
  useEffect(() => {
    const unsubscribe = subscribeToExamPublished((payload) => {
      setNotification(payload)
      dispatch(fetchExams())
    })
    return () => unsubscribe()
  }, [dispatch])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 12000)
    return () => clearTimeout(timer)
  }, [notification])

  const loadResults = () => {
    setResultsStatus('loading')
    getMyResults()
      .then((data) => {
        setResults(data || [])
        setResultsStatus('succeeded')
      })
      .catch(() => setResultsStatus('failed'))
  }

  useEffect(() => {
    loadResults()
  }, [])

  useEffect(() => {
    document.title = `Examora — ${tab} Examinations`
  }, [tab])

  const stats = useMemo(
    () => [
      {
        id: 1,
        label: 'Available Exams',
        value: examsData.filter((e) => e.status === 'Available').length,
        subtext: 'Active testing window',
      },
      {
        id: 2,
        label: 'Upcoming Exams',
        value: examsData.filter((e) => e.status === 'Upcoming').length,
        subtext: 'Scheduled on calendar',
      },
      {
        id: 3,
        label: 'Completed Attempts',
        value: results.length,
        subtext: 'Graded & finalized',
      },
    ],
    [examsData, results],
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
    const sum = results.reduce((acc, r) => acc + (r.percentage || 0), 0)
    return Math.round(sum / results.length)
  }, [results])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-paper swiss-grid-pattern">
      <Sidebar links={studentSidebarLinks} footerLabel="STUDENT_PORTAL // SECURE" />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b-2 border-line/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                  ACADEMIC DASHBOARD // CANDIDATE TERMINAL
                </span>
              </div>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Welcome, {user?.name?.split(' ')[0]}
              </h1>
              <p className="mt-1 text-xs text-muted">
                Inspect assigned examinations, active test windows, and evaluated scorecards.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <LiveIndicator />
              <button
                type="button"
                onClick={loadExams}
                className="focus-ring neo-btn-press rounded-lg border-2 border-line bg-paper-raised p-2 text-ink shadow-[2px_2px_0px_var(--color-line)] hover:bg-paper"
                title="Refresh examinations"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Swiss Stat Cards */}
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-28 neo-card animate-pulse bg-paper-raised" />
                ))
              : stats.map((stat) => (
                  <StatCard
                    key={stat.id}
                    label={stat.label}
                    value={stat.value}
                    subtext={stat.subtext}
                  />
                ))}
          </div>

          {/* Main Content Grid: Exams + Recent Results */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left: Examinations Filter & Grid */}
            <section>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Neo-brutalist segmented tabs */}
                <div className="flex flex-wrap gap-1.5 rounded-lg border-2 border-line bg-paper-raised p-1 shadow-[2px_2px_0px_var(--color-line)]">
                  {tabs.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => dispatch(setDashboardTab(t))}
                      className={`focus-ring rounded px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                        tab === t
                          ? 'border-2 border-line bg-ink text-paper shadow-[2px_2px_0px_var(--color-line)]'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    placeholder="Search examinations…"
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="focus-ring w-full rounded-lg border-2 border-line bg-paper-raised pl-9 pr-3 py-1.5 font-sans text-xs font-medium text-ink placeholder:text-muted"
                  />
                </div>
              </div>

              {/* Exam Grid */}
              <div className="mt-6">
                {isLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="h-44 neo-card animate-pulse bg-paper-raised" />
                    ))}
                  </div>
                ) : isError ? (
                  <div className="neo-card flex flex-col items-center gap-3 p-8 text-center border-coral bg-coral-soft text-coral">
                    <AlertCircle size={24} />
                    <p className="font-display font-bold">Failed to load examinations</p>
                    <p className="text-xs">{examsError || 'Please verify network connection.'}</p>
                    <Button variant="outline" size="sm" onClick={loadExams}>
                      Try Again
                    </Button>
                  </div>
                ) : filteredExams.length === 0 ? (
                  <div className="neo-card p-12 text-center">
                    <BookOpen size={36} className="mx-auto text-muted" />
                    <h3 className="mt-3 font-display text-lg font-bold text-ink">
                      No examinations found
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {searchQuery
                        ? `No examinations matching "${searchQuery}".`
                        : `No ${tab.toLowerCase()} examinations are active right now.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredExams.map((exam) => (
                      <ExamCard key={exam.id} exam={exam} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Right: Academic Performance Summary */}
            <aside className="space-y-6">
              {/* Score Dossier Card */}
              <div className="neo-card p-5">
                <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                    PERFORMANCE SUMMARY
                  </span>
                  <Award size={16} className="text-cobalt" />
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted font-medium">CUMULATIVE AVERAGE</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-ink tabular-nums">
                    {averageScore !== null ? `${averageScore}%` : 'N/A'}
                  </p>
                </div>

                <div className="mt-4 border-t-2 border-line/10 pt-3">
                  <p className="font-mono text-[11px] text-muted">
                    {results.length > 0
                      ? `Computed across ${results.length} official student attempt${results.length === 1 ? '' : 's'}.`
                      : 'No attempts evaluated yet.'}
                  </p>
                </div>
              </div>

              {/* Recent Results Feed */}
              <div className="neo-card p-5">
                <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                    RECENT SCORECARDS
                  </span>
                  <span className="font-mono text-xs font-bold text-ink">
                    {results.length}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {resultsStatus === 'loading' ? (
                    <div className="p-4 text-center font-mono text-xs text-muted animate-pulse">
                      Loading scorecards…
                    </div>
                  ) : results.length === 0 ? (
                    <p className="p-4 text-center font-mono text-xs text-muted border-2 border-dashed border-line/30 rounded-lg">
                      No examination results recorded yet.
                    </p>
                  ) : (
                    results.slice(0, 3).map((r) => (
                      <ResultCard key={r._id || r.id} result={r} />
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      <ExamNotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />
    </div>
  )
}
