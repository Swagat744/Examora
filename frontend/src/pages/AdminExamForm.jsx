import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import { getExamById, createExam, updateExam } from '../services/examService'
import { fetchExams } from '../redux/slices/examSlice'
import { adminSidebarLinks } from '../data/sidebarLinks'

const inputClass =
  'focus-ring w-full rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-muted'

function toDateTimeLocal(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminExamForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    instructions: '',
    duration: 30,
    totalMarks: 10,
    numberOfQuestions: 5,
    startTime: toDateTimeLocal(new Date(Date.now() + 3600000)), // 1 hour from now
    endTime: toDateTimeLocal(new Date(Date.now() + 7200000)),   // 2 hours from now
    status: 'draft',
  })

  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEditing) {
      getExamById(id)
        .then((data) => {
          setForm({
            title: data.title || '',
            subject: data.subject || '',
            description: data.description || '',
            instructions: data.instructions || '',
            duration: data.duration || 30,
            totalMarks: data.totalMarks ?? data.marks ?? 0,
            numberOfQuestions: data.numberOfQuestions ?? data.questions ?? 0,
            startTime: toDateTimeLocal(data.startTime),
            endTime: toDateTimeLocal(data.endTime),
            status: data.rawStatus || 'draft',
          })
        })
        .catch((err) => {
          setError(err.message || 'Failed to load exam.')
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }))
  }

  const validate = () => {
    if (!form.title.trim()) return 'Exam title is required'
    if (!form.subject.trim()) return 'Subject is required'
    if (!form.duration || Number(form.duration) < 1) return 'Duration must be at least 1 minute'
    if (form.totalMarks === '' || Number(form.totalMarks) < 0) return 'Total marks must be non-negative'
    if (form.numberOfQuestions === '' || Number(form.numberOfQuestions) < 0) return 'Number of questions must be non-negative'
    if (!form.startTime) return 'Start time is required'
    if (form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
      return 'End time must be after start time'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        instructions: form.instructions.trim(),
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        numberOfQuestions: Number(form.numberOfQuestions),
        startTime: new Date(form.startTime).toISOString(),
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
        status: form.status,
      }

      if (isEditing) {
        await updateExam(id, payload)
        dispatch(fetchExams())
        navigate(`/admin/exams/${id}`)
      } else {
        const created = await createExam(payload)
        dispatch(fetchExams())
        // Immediately navigate to question management so questions can be added
        const examId = created._id || created.id
        navigate(`/admin/exams/${examId}/questions`)
      }
    } catch (err) {
      setError(err.message || 'Failed to save examination.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={adminSidebarLinks} footerLabel={`Signed in as ${user?.role === 'admin' ? 'Admin' : 'Faculty'}`} />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
          <Link
            to="/admin/exams"
            className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to Examinations
          </Link>

          <div className="mt-4">
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {isEditing ? 'Edit Examination' : 'Create New Examination'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isEditing
                ? 'Update exam schedule, duration, instructions, and status.'
                : 'Define exam parameters. You can add questions right after saving.'}
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-coral/30 bg-coral-soft p-3.5 text-sm text-coral">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="mt-8 p-12 text-center text-sm text-muted">Loading exam details…</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
              <div className="rounded-3xl border border-line bg-paper-raised p-6 sm:p-8 flex flex-col gap-5">
                <h2 className="text-base font-semibold text-ink">Basic Details</h2>

                <div>
                  <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Exam Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={form.title}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Data Structures & Algorithms Mid-Term"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Subject / Course *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Brief description of the exam coverage and topics…"
                  />
                </div>

                <div>
                  <label htmlFor="instructions" className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Instructions for Candidates
                  </label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows={3}
                    value={form.instructions}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Read each question carefully. Once submitted, answers cannot be changed."
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-paper-raised p-6 sm:p-8 flex flex-col gap-5">
                <h2 className="text-base font-semibold text-ink">Timing, Marks & Status</h2>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Duration (Minutes) *
                    </label>
                    <input
                      id="duration"
                      name="duration"
                      type="number"
                      min={1}
                      required
                      value={form.duration}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="numberOfQuestions" className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Number of Questions
                    </label>
                    <input
                      id="numberOfQuestions"
                      name="numberOfQuestions"
                      type="number"
                      min={0}
                      value={form.numberOfQuestions}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="totalMarks" className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Total Marks
                    </label>
                    <input
                      id="totalMarks"
                      name="totalMarks"
                      type="number"
                      min={0}
                      value={form.totalMarks}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startTime" className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Start Time *
                    </label>
                    <input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      required
                      value={form.startTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="mb-1.5 block text-sm font-medium text-ink-soft">
                      End Time (Optional)
                    </label>
                    <input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={form.endTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Exam Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="draft">Draft (hidden from students)</option>
                    <option value="scheduled">Scheduled (upcoming for students)</option>
                    <option value="active">Active (available for students to attempt)</option>
                    <option value="completed">Completed (closed)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/admin/exams')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  className="inline-flex items-center gap-2"
                >
                  <Save size={16} />
                  {submitting ? 'Saving…' : isEditing ? 'Update Exam' : 'Create & Add Questions'}
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}
