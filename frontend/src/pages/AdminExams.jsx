import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, HelpCircle, Edit, Trash2, Eye, AlertTriangle, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatusPill from '../components/StatusPill'
import Button from '../components/Button'
import { fetchExams, deleteExamThunk } from '../redux/slices/examSlice'
import { adminSidebarLinks } from '../data/sidebarLinks'

export default function AdminExams() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const exams = useSelector((state) => state.exam.exams)
  const examsStatus = useSelector((state) => state.exam.examsStatus)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'scheduled' | 'draft' | 'completed'
  const [examToDelete, setExamToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    dispatch(fetchExams())
  }, [dispatch])

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase())

      if (statusFilter === 'all') return matchesSearch
      const raw = (e.rawStatus || e.status || '').toLowerCase()
      if (statusFilter === 'active') return matchesSearch && (raw === 'active' || raw === 'available')
      if (statusFilter === 'scheduled') return matchesSearch && (raw === 'scheduled' || raw === 'upcoming')
      if (statusFilter === 'draft') return matchesSearch && raw === 'draft'
      if (statusFilter === 'completed') return matchesSearch && raw === 'completed'
      return matchesSearch
    })
  }, [exams, search, statusFilter])

  const handleDelete = async () => {
    if (!examToDelete) return
    setIsDeleting(true)
    try {
      const examId = examToDelete.id || examToDelete._id
      await dispatch(deleteExamThunk(examId)).unwrap()
      setFeedback({ type: 'success', text: `Exam "${examToDelete.title}" and its questions deleted.` })
      setExamToDelete(null)
    } catch (err) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to delete exam.' })
    } finally {
      setIsDeleting(false)
    }
  }

  const isLoading = examsStatus === 'loading' || examsStatus === 'idle'

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={adminSidebarLinks} footerLabel={`Signed in as ${user?.role === 'admin' ? 'Admin' : 'Faculty'}`} />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Manage Examinations</h1>
              <p className="mt-1 text-sm text-muted">Create, edit, schedule, and manage questions for all exams</p>
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

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`mt-6 flex items-center justify-between gap-3 rounded-2xl p-4 text-sm ${
                feedback.type === 'success'
                  ? 'border border-teal/30 bg-teal-soft text-teal'
                  : 'border border-coral/30 bg-coral-soft text-coral'
              }`}
            >
              <span>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="focus-ring rounded-lg p-1 hover:bg-black/5"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by title or subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus-ring w-full rounded-xl border border-line bg-paper-raised pl-10 pr-4 py-2 text-sm text-ink placeholder:text-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-paper-raised p-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'draft', label: 'Draft' },
                { id: 'completed', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-ink text-paper'
                      : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exams Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper-raised">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-muted">Loading examinations…</div>
            ) : filteredExams.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-base font-semibold text-ink">No examinations found</p>
                <p className="mt-1 text-sm text-muted">
                  {search ? 'Try adjusting your search query or filter.' : 'Create an examination to get started.'}
                </p>
                {!search && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 inline-flex items-center gap-1.5"
                    onClick={() => navigate('/admin/exams/new')}
                  >
                    <Plus size={14} /> Create Exam
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                      <th scope="col" className="px-5 py-3.5 font-medium">Exam Details</th>
                      <th scope="col" className="px-5 py-3.5 font-medium">Schedule</th>
                      <th scope="col" className="px-5 py-3.5 font-medium">Questions</th>
                      <th scope="col" className="px-5 py-3.5 font-medium">Total Marks</th>
                      <th scope="col" className="px-5 py-3.5 font-medium">Status</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam, i) => (
                      <tr
                        key={exam.id || exam._id}
                        className={`transition-colors hover:bg-ink/5 ${
                          i !== filteredExams.length - 1 ? 'border-b border-line' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <Link
                            to={`/admin/exams/${exam.id || exam._id}`}
                            className="font-medium text-ink hover:text-teal"
                          >
                            {exam.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted">{exam.subject}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-ink-soft">
                          <p>{exam.date || 'Flexible'}</p>
                          <p className="text-muted">{exam.duration} mins</p>
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-ink">
                          {exam.questions || exam.numberOfQuestions || 0}
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-ink">
                          {exam.marks || exam.totalMarks || 0}
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={exam.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to={`/admin/exams/${exam.id || exam._id}/questions`}
                              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper-raised hover:text-ink"
                              title="Manage Questions"
                            >
                              <HelpCircle size={13} />
                              <span className="hidden sm:inline">Questions</span>
                            </Link>
                            <Link
                              to={`/admin/exams/${exam.id || exam._id}/edit`}
                              className="focus-ring rounded-lg border border-line bg-paper p-1.5 text-ink-soft hover:bg-paper-raised hover:text-ink"
                              title="Edit Exam"
                            >
                              <Edit size={13} />
                            </Link>
                            <Link
                              to={`/admin/exams/${exam.id || exam._id}`}
                              className="focus-ring rounded-lg border border-line bg-paper p-1.5 text-ink-soft hover:bg-paper-raised hover:text-ink"
                              title="View Details"
                            >
                              <Eye size={13} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setExamToDelete(exam)}
                              className="focus-ring rounded-lg border border-line bg-paper p-1.5 text-coral hover:border-coral/40 hover:bg-coral-soft"
                              title="Delete Exam"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-line bg-paper-raised p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-soft text-coral">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-ink">Delete Examination</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Are you sure you want to delete <strong>"{examToDelete.title}"</strong>?
                </p>
                <p className="mt-2 rounded-xl border border-coral/30 bg-coral-soft p-2.5 text-xs text-coral">
                  ⚠️ This action is permanent. All questions and student attempt records associated with this exam will also be deleted.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setExamToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
