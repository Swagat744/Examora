import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FileText, ArrowRight, Activity } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import StatusPill from '../components/StatusPill'
import Button from '../components/Button'
import { fetchExams } from '../redux/slices/examSlice'
import { getRecentResults } from '../services/examService'
import { adminSidebarLinks } from '../data/sidebarLinks'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const exams = useSelector((state) => state.exam.exams)
  const examsStatus = useSelector((state) => state.exam.examsStatus)

  const [recentAttempts, setRecentAttempts] = useState([])
  const [attemptsLoading, setAttemptsLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchExams())
    getRecentResults()
      .then((data) => setRecentAttempts(data || []))
      .catch(() => setRecentAttempts([]))
      .finally(() => setAttemptsLoading(false))
  }, [dispatch])

  const stats = useMemo(() => {
    const totalExams = exams.length
    const active = exams.filter((e) => e.rawStatus === 'active' || e.status === 'Available').length
    const scheduled = exams.filter((e) => e.rawStatus === 'scheduled' || e.status === 'Upcoming').length
    const totalQuestions = exams.reduce((sum, e) => sum + (Number(e.questions) || Number(e.numberOfQuestions) || 0), 0)

    return [
      { id: 1, label: 'Total Exams', value: totalExams, subtext: 'Configured in Atlas' },
      { id: 2, label: 'Active Testing', value: active, subtext: 'Open candidate window' },
      { id: 3, label: 'Scheduled', value: scheduled, subtext: 'Upcoming timetable' },
      { id: 4, label: 'Total Questions', value: totalQuestions, subtext: 'Authoritative bank' },
    ]
  }, [exams])

  const isLoading = examsStatus === 'loading' || examsStatus === 'idle'

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-paper swiss-grid-pattern">
      <Sidebar
        links={adminSidebarLinks}
        footerLabel={`ACADEMIC_PORTAL // ${user?.role === 'admin' ? 'DEAN_ADMIN' : 'FACULTY'}`}
      />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-4 border-b-2 border-line/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                FACULTY CONTROL CENTRE // OVERVIEW
              </span>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Welcome, {user?.name?.split(' ')[0] || 'Faculty'}
              </h1>
              <p className="mt-1 text-xs text-muted">
                Live examination telemetry, question banks, and candidate attempt submissions.
              </p>
            </div>
            <Button
              type="button"
              variant="accent"
              size="md"
              className="inline-flex items-center gap-2 self-start sm:self-auto"
              onClick={() => navigate('/admin/exams/new')}
            >
              <Plus size={16} aria-hidden="true" />
              <span>AUTHOR NEW EXAM</span>
            </Button>
          </div>

          {/* Real Statistics from MongoDB Atlas */}
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
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

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* Active & Recent Examinations */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Managed Examinations
                  </h2>
                  <p className="font-mono text-xs text-muted">Active and scheduled papers in database</p>
                </div>
                <Link
                  to="/admin/exams"
                  className="focus-ring font-mono text-xs font-bold uppercase tracking-wider text-cobalt hover:underline flex items-center gap-1"
                >
                  View All ({exams.length}) <ArrowRight size={13} />
                </Link>
              </div>

              <div className="neo-card mt-4 overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center font-mono text-xs text-muted animate-pulse">
                    LOADING EXAMINATIONS…
                  </div>
                ) : exams.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText size={32} className="mx-auto text-muted" aria-hidden="true" />
                    <p className="mt-2 font-display text-sm font-bold text-ink">No examinations authored yet</p>
                    <p className="mt-1 font-mono text-xs text-muted">Get started by creating your first paper.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate('/admin/exams/new')}
                    >
                      Author Exam
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-line/10 bg-paper font-mono uppercase tracking-wider text-muted">
                          <th className="px-4 py-3 font-bold">Paper Title</th>
                          <th className="px-4 py-3 font-bold">Status</th>
                          <th className="px-4 py-3 font-bold">Questions</th>
                          <th className="px-4 py-3 font-bold">Marks</th>
                          <th className="px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-line/10">
                        {exams.slice(0, 5).map((e) => {
                          const examId = e.id || e._id
                          return (
                            <tr key={examId} className="hover:bg-paper transition-colors font-mono">
                              <td className="px-4 py-3.5 font-sans">
                                <Link
                                  to={`/admin/exams/${examId}`}
                                  className="font-bold text-ink hover:text-cobalt hover:underline"
                                >
                                  {e.title}
                                </Link>
                                <span className="block font-mono text-[10px] text-muted uppercase">
                                  {e.subject}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <StatusPill status={e.rawStatus ? e.rawStatus.toUpperCase() : e.status} />
                              </td>
                              <td className="px-4 py-3.5 font-bold text-ink">
                                {e.numberOfQuestions ?? e.questions ?? 0}
                              </td>
                              <td className="px-4 py-3.5 font-bold text-ink">
                                {e.totalMarks ?? e.marks ?? 0}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <Link
                                  to={`/admin/exams/${examId}`}
                                  className="focus-ring font-bold text-cobalt hover:underline"
                                >
                                  MANAGE &rarr;
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Candidate Submissions Live Activity */}
            <aside>
              <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Candidate Feed
                  </h2>
                  <p className="font-mono text-xs text-muted">Recent graded student attempts</p>
                </div>
                <Activity size={16} className="text-cobalt" />
              </div>

              <div className="neo-card mt-4 p-4">
                {attemptsLoading ? (
                  <div className="p-6 text-center font-mono text-xs text-muted animate-pulse">
                    LOADING FEED…
                  </div>
                ) : recentAttempts.length === 0 ? (
                  <p className="p-6 text-center font-mono text-xs text-muted">
                    No student attempts recorded on the platform yet.
                  </p>
                ) : (
                  <div className="flex flex-col divide-y-2 divide-line/10">
                    {recentAttempts.slice(0, 6).map((att) => (
                      <div key={att._id || att.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-ink text-xs truncate max-w-[170px]">
                            {att.student?.name || 'Anonymous Candidate'}
                          </p>
                          <span className="font-mono text-xs font-bold text-cobalt tabular-nums">
                            {att.score} / {att.totalMarks}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-muted">
                          {att.exam?.title || 'Examination'} &bull; {att.percentage}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
