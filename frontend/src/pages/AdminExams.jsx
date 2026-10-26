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

  // Escape key listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && examToDelete) {
        setExamToDelete(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [examToDelete])

  const isLoading = examsStatus === 'loading' || examsStatus === 'idle'

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-paper swiss-grid-pattern">
      <Sidebar
        links={adminSidebarLinks}
        footerLabel={`ACADEMIC_PORTAL // ${user?.role === 'admin' ? 'DEAN_ADMIN' : 'FACULTY'}`}
      />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b-2 border-line/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                EXAMINATION REPOSITORY // DIRECTORY
              </span>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Examinations Dossier
              </h1>
              <p className="mt-1 text-xs text-muted">
                Create, inspect, schedule, and author questions for all institutional assessments.
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

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`mt-6 flex items-center justify-between gap-3 rounded-lg border-2 p-4 text-xs font-mono font-bold shadow-[3px_3px_0px_var(--color-line)] ${
                feedback.type === 'success'
                  ? 'border-teal bg-teal-soft text-teal'
                  : 'border-coral bg-coral-soft text-coral'
              }`}
            >
              <span>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="focus-ring rounded p-1 hover:bg-black/5"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Filters & Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status pills */}
            <div className="flex flex-wrap gap-1.5 rounded-lg border-2 border-line bg-paper-raised p-1 shadow-[2px_2px_0px_var(--color-line)]">
              {['all', 'active', 'scheduled', 'draft', 'completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`focus-ring rounded px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === st
                      ? 'border-2 border-line bg-ink text-paper shadow-[2px_2px_0px_var(--color-line)]'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search examinations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus-ring w-full rounded-lg border-2 border-line bg-paper-raised pl-9 pr-3 py-1.5 font-sans text-xs font-medium text-ink placeholder:text-muted"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="neo-card mt-6 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center font-mono text-xs text-muted animate-pulse">
                LOADING REPOSITORY…
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-display text-base font-bold text-ink">No examinations match criteria</p>
                <p className="mt-1 font-mono text-xs text-muted">Try adjusting your search query or status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-line/10 bg-paper font-mono uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 font-bold">Paper Title & Subject</th>
                      <th className="px-5 py-3.5 font-bold">Status</th>
                      <th className="px-5 py-3.5 font-bold">Duration</th>
                      <th className="px-5 py-3.5 font-bold">Questions</th>
                      <th className="px-5 py-3.5 font-bold">Total Marks</th>
                      <th className="px-5 py-3.5 text-right font-bold">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-line/10 font-mono">
                    {filteredExams.map((e) => {
                      const examId = e.id || e._id
                      const canManage =
                        user?.role === 'admin' ||
                        !e.createdBy ||
                        String(e.createdBy) === String(user?._id)

                      return (
                        <tr key={examId} className="hover:bg-paper transition-colors">
                          <td className="px-5 py-4 font-sans">
                            <Link
                              to={`/admin/exams/${examId}`}
                              className="font-bold text-sm text-ink hover:text-cobalt hover:underline block"
                            >
                              {e.title}
                            </Link>
                            <span className="font-mono text-[11px] text-muted uppercase">
                              {e.subject}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill status={e.rawStatus ? e.rawStatus.toUpperCase() : e.status} />
                          </td>
                          <td className="px-5 py-4 text-ink font-semibold">
                            {e.duration} mins
                          </td>
                          <td className="px-5 py-4 text-ink font-bold">
                            {e.numberOfQuestions ?? e.questions ?? 0}
                          </td>
                          <td className="px-5 py-4 text-ink font-bold">
                            {e.totalMarks ?? e.marks ?? 0}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/admin/exams/${examId}`}
                                className="focus-ring neo-btn-press rounded border border-line bg-paper p-1.5 text-muted hover:text-ink hover:bg-paper-raised"
                                title="Inspect Exam"
                              >
                                <Eye size={14} />
                              </Link>
                              <Link
                                to={`/admin/exams/${examId}/questions`}
                                className="focus-ring neo-btn-press rounded border border-line bg-paper p-1.5 text-cobalt hover:bg-cobalt-soft"
                                title="Manage Questions"
                              >
                                <HelpCircle size={14} />
                              </Link>
                              {canManage && (
                                <>
                                  <Link
                                    to={`/admin/exams/${examId}/edit`}
                                    className="focus-ring neo-btn-press rounded border border-line bg-paper p-1.5 text-ink hover:bg-paper-raised"
                                    title="Edit Exam Settings"
                                  >
                                    <Edit size={14} />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => setExamToDelete(e)}
                                    className="focus-ring neo-btn-press rounded border border-line bg-paper p-1.5 text-coral hover:bg-coral-soft"
                                    title="Delete Exam"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div
            className="absolute inset-0"
            onClick={() => setExamToDelete(null)}
            aria-hidden="true"
          />
          <div className="neo-card relative z-10 w-full max-w-md p-5 sm:p-7 shadow-[6px_6px_0px_var(--color-line)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 border-b-2 border-line/10 pb-3 text-coral">
              <AlertTriangle size={20} />
              <h3 className="font-display text-lg font-bold">Confirm Deletion</h3>
            </div>

            <p className="mt-4 text-xs font-mono leading-relaxed text-ink-soft">
              Are you sure you want to delete <strong className="text-ink">"{examToDelete.title}"</strong>? This will permanently purge the exam, all associated questions, and candidate attempt submissions.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t-2 border-line/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExamToDelete(null)}
                disabled={isDeleting}
              >
                CANCEL
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'PURGING…' : 'YES, PERMANENTLY DELETE'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
