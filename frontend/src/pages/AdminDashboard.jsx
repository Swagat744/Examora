import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FileText, ArrowRight, HelpCircle } from 'lucide-react'
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
      { id: 1, label: 'Total Exams', value: totalExams },
      { id: 2, label: 'Active Exams', value: active },
      { id: 3, label: 'Scheduled', value: scheduled },
      { id: 4, label: 'Total Questions', value: totalQuestions },
    ]
  }, [exams])

  const isLoading = examsStatus === 'loading' || examsStatus === 'idle'

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={adminSidebarLinks} footerLabel={`Signed in as ${user?.role === 'admin' ? 'Admin' : 'Faculty'}`} />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
              </h1>
              <p className="mt-1 text-sm text-muted">
                Here's a live overview of examinations and student activity across Examora
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="inline-flex items-center gap-2 self-start sm:self-auto"
              onClick={() => navigate('/admin/exams/new')}
            >
              <Plus size={16} aria-hidden="true" />
              Create Exam
            </Button>
          </div>

          {/* Real Statistics from MongoDB */}
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-line bg-paper-raised" />
                ))
              : stats.map((stat) => <StatCard key={stat.id} label={stat.label} value={stat.value} tone="teal" />)}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* Real Active & Recent Exams */}
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">Recent Examinations</h2>
                  <p className="mt-0.5 text-xs text-muted">Live examinations stored in MongoDB Atlas</p>
                </div>
                <Link
                  to="/admin/exams"
                  className="focus-ring inline-flex items-center gap-1 text-xs font-medium text-teal hover:underline"
                >
                  View all ({exams.length}) <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper-raised">
                {isLoading ? (
                  <div className="p-8 text-center text-sm text-muted">Loading examinations…</div>
                ) : exams.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText size={32} className="mx-auto text-muted" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-ink">No examinations found</p>
                    <p className="mt-1 text-xs text-muted">Get started by creating your first exam.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4 inline-flex items-center gap-1.5"
                      onClick={() => navigate('/admin/exams/new')}
                    >
                      <Plus size={14} /> Create Exam
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                          <th scope="col" className="px-4 py-3 font-medium sm:px-5">Exam</th>
                          <th scope="col" className="px-4 py-3 font-medium sm:px-5">Status</th>
                          <th scope="col" className="px-4 py-3 font-medium sm:px-5">Questions</th>
                          <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.slice(0, 6).map((exam, i) => (
                          <tr
                            key={exam.id || exam._id}
                            className={`transition-colors hover:bg-ink/5 ${
                              i !== Math.min(exams.length, 6) - 1 ? 'border-b border-line' : ''
                            }`}
                          >
                            <td className="px-4 py-3.5 sm:px-5">
                              <Link
                                to={`/admin/exams/${exam.id || exam._id}`}
                                className="font-medium text-ink hover:text-teal"
                              >
                                {exam.title}
                              </Link>
                              <p className="text-xs text-muted">{exam.subject}</p>
                            </td>
                            <td className="px-4 py-3.5 sm:px-5">
                              <StatusPill status={exam.status} />
                            </td>
                            <td className="px-4 py-3.5 font-mono text-ink-soft sm:px-5">
                              {exam.questions || exam.numberOfQuestions || 0}
                            </td>
                            <td className="px-4 py-3.5 text-right sm:px-5">
                              <div className="inline-flex items-center gap-1.5">
                                <Link
                                  to={`/admin/exams/${exam.id || exam._id}/questions`}
                                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-paper-raised hover:text-ink"
                                  title="Manage Questions"
                                >
                                  <HelpCircle size={12} /> Questions
                                </Link>
                                <Link
                                  to={`/admin/exams/${exam.id || exam._id}`}
                                  className="focus-ring rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-paper-raised hover:text-ink"
                                >
                                  View
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Real Student Activity */}
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Recent Activity</h2>
              <p className="mt-0.5 text-xs text-muted">Latest submissions and platform events</p>

              <div className="mt-4 flex flex-col gap-3">
                {attemptsLoading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl border border-line bg-paper-raised" />
                  ))
                ) : recentAttempts.length > 0 ? (
                  recentAttempts.slice(0, 5).map((att) => (
                    <div
                      key={att._id}
                      className="flex items-start gap-3 rounded-xl border border-line bg-paper-raised p-3.5 transition-colors hover:border-ink/20"
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {att.student?.name || 'Student'} completed <span className="text-teal">{att.exam?.title || 'Exam'}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          Score: {att.score}/{att.totalMarks} ({att.percentage}%) •{' '}
                          {new Date(att.submittedAt).toLocaleTimeString('en-IN', {
                            hour: 'numeric',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  exams.slice(0, 4).map((e) => (
                    <div
                      key={e.id || e._id}
                      className="flex items-start gap-3 rounded-xl border border-line bg-paper-raised p-3.5"
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-ink-soft">
                          Examination <strong className="text-ink">{e.title}</strong> is {e.status.toLowerCase()}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">{e.date || 'Available on Examora'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
