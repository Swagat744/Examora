import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, Edit, HelpCircle, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatusPill from '../components/StatusPill'
import Button from '../components/Button'
import { getExamById, updateExam, deleteExam } from '../services/examService'
import { getQuestionsForExam } from '../services/questionService'
import { fetchExams } from '../redux/slices/examSlice'
import { adminSidebarLinks } from '../data/sidebarLinks'

export default function AdminExamDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const examData = await getExamById(id)
      setExam(examData)
      const qData = await getQuestionsForExam(id)
      setQuestions(qData || [])
    } catch (err) {
      setError(err.message || 'Failed to load examination details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatusChange = async (newStatus) => {
    if (!exam || newStatus === exam.rawStatus) return
    setStatusUpdating(true)
    try {
      const updated = await updateExam(id, { status: newStatus })
      setExam(updated)
      dispatch(fetchExams())
      setFeedback(`Exam status updated to ${newStatus.toUpperCase()}.`)
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update status.')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteExam(id)
      dispatch(fetchExams())
      navigate('/admin/exams')
    } catch (err) {
      setError(err.message || 'Failed to delete exam.')
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-paper swiss-grid-pattern">
        <Sidebar links={adminSidebarLinks} />
        <div className="flex-1 p-12 text-center font-mono text-xs text-muted animate-pulse">
          LOADING EXAMINATION DOSSIER…
        </div>
      </div>
    )
  }

  if (error && !exam) {
    return (
      <div className="flex min-h-screen bg-paper swiss-grid-pattern">
        <Sidebar links={adminSidebarLinks} />
        <div className="flex-1 p-12 text-center">
          <p className="font-display text-base font-bold text-coral">{error}</p>
          <Link to="/admin/exams" className="mt-4 inline-block font-mono text-xs text-cobalt hover:underline">
            &larr; Return to Examinations
          </Link>
        </div>
      </div>
    )
  }

  const canModify =
    user?.role === 'admin' ||
    (exam?.createdBy && String(exam.createdBy) === String(user?._id)) ||
    (!exam?.createdBy && user?.role === 'admin')

  return (
    <div className="flex min-h-screen bg-paper swiss-grid-pattern">
      <Sidebar
        links={adminSidebarLinks}
        footerLabel={`ACADEMIC_PORTAL // ${user?.role === 'admin' ? 'DEAN_ADMIN' : 'FACULTY'}`}
      />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
          <Link
            to="/admin/exams"
            className="focus-ring inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-ink"
          >
            <ArrowLeft size={14} />
            <span>BACK TO DIRECTORY</span>
          </Link>

          {feedback && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-teal bg-teal-soft p-3 font-mono text-xs font-bold text-teal shadow-[2px_2px_0px_var(--color-teal)]">
              <CheckCircle2 size={16} />
              <span>{feedback}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border-2 border-coral bg-coral-soft p-3 font-mono text-xs font-bold text-coral shadow-[2px_2px_0px_var(--color-coral)]">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dossier Header */}
          <div className="neo-card mt-5 p-6 sm:p-8 shadow-[5px_5px_0px_var(--color-line)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b-2 border-line/10 pb-5">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                  {exam.subject} // EXAM DOSSIER
                </span>
                <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                  {exam.title}
                </h1>
                {exam.description && (
                  <p className="mt-2 text-xs leading-relaxed text-muted max-w-2xl">
                    {exam.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <StatusPill status={exam.rawStatus ? exam.rawStatus.toUpperCase() : exam.status} />
              </div>
            </div>

            {/* Swiss Grid Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
              <div className="rounded-lg border-2 border-line/30 bg-paper p-3 text-center">
                <span className="text-[10px] font-bold text-muted uppercase">Duration</span>
                <p className="mt-1 text-xl font-extrabold text-ink">{exam.duration}m</p>
              </div>
              <div className="rounded-lg border-2 border-line/30 bg-paper p-3 text-center">
                <span className="text-[10px] font-bold text-muted uppercase">Questions</span>
                <p className="mt-1 text-xl font-extrabold text-ink">{questions.length}</p>
              </div>
              <div className="rounded-lg border-2 border-line/30 bg-paper p-3 text-center">
                <span className="text-[10px] font-bold text-muted uppercase">Total Marks</span>
                <p className="mt-1 text-xl font-extrabold text-ink">{exam.totalMarks ?? 0}</p>
              </div>
              <div className="rounded-lg border-2 border-line/30 bg-paper p-3 text-center">
                <span className="text-[10px] font-bold text-muted uppercase">Candidate Attempts</span>
                <p className="mt-1 text-xl font-extrabold text-ink">{exam.attemptCount ?? 0}</p>
              </div>
            </div>

            {/* Workflow Status Controls */}
            {canModify && (
              <div className="mt-6 border-t-2 border-line/10 pt-5">
                <span className="block font-mono text-xs font-bold uppercase tracking-wider text-ink mb-2">
                  SET WORKFLOW STATUS
                </span>
                <div className="flex flex-wrap gap-2">
                  {['draft', 'scheduled', 'active', 'completed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={statusUpdating || exam.rawStatus === st}
                      onClick={() => handleStatusChange(st)}
                      className={`focus-ring neo-btn-press rounded border-2 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                        exam.rawStatus === st
                          ? 'border-line bg-ink text-paper shadow-[2px_2px_0px_var(--color-line)]'
                          : 'border-line/40 bg-paper hover:border-line text-ink'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Operations Row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line/10 pt-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="accent"
                  size="md"
                  to={`/admin/exams/${id}/questions`}
                >
                  <HelpCircle size={16} />
                  <span>MANAGE QUESTION BANK ({questions.length})</span>
                </Button>

                {canModify && (
                  <Button
                    variant="outline"
                    size="md"
                    to={`/admin/exams/${id}/edit`}
                  >
                    <Edit size={15} />
                    <span>EDIT SPECIFICATIONS</span>
                  </Button>
                )}
              </div>

              {canModify && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={14} />
                  <span>PURGE EXAM</span>
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="neo-card w-full max-w-md p-6 sm:p-7 shadow-[6px_6px_0px_var(--color-line)]">
            <div className="flex items-center gap-2.5 border-b-2 border-line/10 pb-3 text-coral">
              <AlertTriangle size={20} />
              <h3 className="font-display text-lg font-bold">Confirm Deletion</h3>
            </div>

            <p className="mt-4 text-xs font-mono leading-relaxed text-ink-soft">
              This will permanently delete this examination, all questions in its bank, and student submissions.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-line/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
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
                {isDeleting ? 'PURGING…' : 'CONFIRM PURGE'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
