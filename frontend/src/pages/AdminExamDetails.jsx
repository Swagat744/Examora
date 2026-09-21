import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, Edit, HelpCircle, Trash2, Clock, Award, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

  const loadData = async () => {
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
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleStatusChange = async (newStatus) => {
    if (!exam || newStatus === exam.rawStatus) return
    setStatusUpdating(true)
    try {
      const updated = await updateExam(id, { status: newStatus })
      setExam(updated)
      dispatch(fetchExams())
      setFeedback(`Exam status updated to ${newStatus}.`)
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
      <div className="flex min-h-screen bg-paper">
        <Sidebar links={adminSidebarLinks} />
        <div className="flex-1 p-12 text-center text-sm text-muted">Loading examination details…</div>
      </div>
    )
  }

  if (error && !exam) {
    return (
      <div className="flex min-h-screen bg-paper">
        <Sidebar links={adminSidebarLinks} />
        <div className="flex-1 p-12 text-center">
          <p className="text-base font-semibold text-coral">{error}</p>
          <Link to="/admin/exams" className="mt-4 inline-block text-sm text-teal hover:underline">
            Back to Examinations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={adminSidebarLinks} footerLabel={`Signed in as ${user?.role === 'admin' ? 'Admin' : 'Faculty'}`} />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
          <Link
            to="/admin/exams"
            className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to Examinations
          </Link>

          {feedback && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal/30 bg-teal-soft p-3 text-xs text-teal">
              <CheckCircle2 size={15} />
              <span>{feedback}</span>
            </div>
          )}

          {/* Exam Header */}
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{exam.title}</h1>
                <StatusPill status={exam.status} />
              </div>
              <p className="mt-1 text-sm font-medium text-teal">{exam.subject}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                className="inline-flex items-center gap-1.5"
                onClick={() => navigate(`/admin/exams/${id}/questions`)}
              >
                <HelpCircle size={15} />
                Manage Questions ({questions.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="inline-flex items-center gap-1.5"
                onClick={() => navigate(`/admin/exams/${id}/edit`)}
              >
                <Edit size={14} />
                Edit
              </Button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="focus-ring rounded-xl border border-line bg-paper p-2 text-coral hover:border-coral/40 hover:bg-coral-soft"
                title="Delete Exam"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-7 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted">
                <Clock size={14} className="text-teal" /> Duration
              </div>
              <p className="mt-1 font-display text-lg font-semibold text-ink">{exam.duration} mins</p>
            </div>

            <div className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted">
                <HelpCircle size={14} className="text-teal" /> Questions
              </div>
              <p className="mt-1 font-display text-lg font-semibold text-ink">{questions.length}</p>
            </div>

            <div className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted">
                <Award size={14} className="text-teal" /> Total Marks
              </div>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                {questions.reduce((sum, q) => sum + (q.marks || 0), 0) || exam.marks || exam.totalMarks || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted">
                <Calendar size={14} className="text-teal" /> Status Workflow
              </div>
              <select
                value={exam.rawStatus || 'draft'}
                disabled={statusUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="focus-ring mt-1 block w-full rounded-lg border border-line bg-paper px-2 py-1 text-xs font-medium text-ink"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active (Available)</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Description & Instructions */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-line bg-paper-raised p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Description</h2>
              <p className="mt-2 text-sm text-ink leading-relaxed">
                {exam.description || <span className="text-muted italic">No description provided.</span>}
              </p>
            </div>

            <div className="rounded-3xl border border-line bg-paper-raised p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Candidate Instructions</h2>
              <p className="mt-2 text-sm text-ink leading-relaxed">
                {exam.instructions || <span className="text-muted italic">No specific instructions set.</span>}
              </p>
            </div>
          </div>

          {/* Questions Preview Section */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Questions ({questions.length})</h2>
                <p className="mt-0.5 text-xs text-muted">Preview of multiple-choice questions configured for this exam</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/exams/${id}/questions`)}
              >
                Open Question Manager
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {questions.length === 0 ? (
                <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
                  <p className="text-sm font-medium text-ink">No questions added yet</p>
                  <p className="mt-1 text-xs text-muted">
                    This examination requires questions before candidates can take it.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="mt-4 inline-flex items-center gap-1.5"
                    onClick={() => navigate(`/admin/exams/${id}/questions`)}
                  >
                    <HelpCircle size={14} /> Add First Question
                  </Button>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q._id || q.id} className="rounded-2xl border border-line bg-paper-raised p-5">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="font-semibold text-ink">Question {idx + 1}</span>
                      <span className="font-mono">{q.marks} mark{q.marks === 1 ? '' : 's'}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-ink">{q.questionText || q.text}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {(q.options || []).map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctAnswer
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                              isCorrect
                                ? 'border-teal/50 bg-teal-soft/80 font-medium text-teal'
                                : 'border-line bg-paper text-ink-soft'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {isCorrect && <span className="font-semibold text-[10px] uppercase">Correct</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-line bg-paper-raised p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-soft text-coral">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-ink">Delete Examination</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Are you sure you want to delete <strong>"{exam.title}"</strong>?
                </p>
                <p className="mt-2 rounded-xl border border-coral/30 bg-coral-soft p-2.5 text-xs text-coral">
                  ⚠️ This action will permanently remove all associated questions and student attempts.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowDeleteModal(false)}
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
