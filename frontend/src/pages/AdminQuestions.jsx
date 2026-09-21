import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import { getExamById } from '../services/examService'
import {
  getQuestionsForExam,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../services/questionService'
import { fetchExams } from '../redux/slices/examSlice'
import { adminSidebarLinks } from '../data/sidebarLinks'

const inputClass =
  'focus-ring w-full rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-muted'

export default function AdminQuestions() {
  const { id: examId } = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Question Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null) // null = Add mode
  const [qForm, setQForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1,
    questionOrder: 1,
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // Delete Modal State
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadQuestionsData = async () => {
    try {
      setLoading(true)
      const examData = await getExamById(examId)
      setExam(examData)
      const qData = await getQuestionsForExam(examId)
      setQuestions(qData || [])
    } catch (err) {
      setError(err.message || 'Failed to load questions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestionsData()
  }, [examId])

  const openAddModal = () => {
    setEditingQuestion(null)
    setQForm({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1,
      questionOrder: questions.length + 1,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const openEditModal = (q) => {
    setEditingQuestion(q)
    setQForm({
      questionText: q.questionText || q.text || '',
      options: Array.isArray(q.options) && q.options.length >= 2 ? [...q.options] : ['', ''],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      marks: q.marks || 1,
      questionOrder: q.questionOrder || 1,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleOptionChange = (index, value) => {
    setQForm((prev) => {
      const newOpts = [...prev.options]
      newOpts[index] = value
      return { ...prev, options: newOpts }
    })
  }

  const addOption = () => {
    if (qForm.options.length >= 8) return
    setQForm((prev) => ({ ...prev, options: [...prev.options, ''] }))
  }

  const removeOption = (index) => {
    if (qForm.options.length <= 2) return
    setQForm((prev) => {
      const newOpts = prev.options.filter((_, i) => i !== index)
      let newCorrect = prev.correctAnswer
      if (newCorrect >= newOpts.length) newCorrect = newOpts.length - 1
      return { ...prev, options: newOpts, correctAnswer: newCorrect }
    })
  }

  const validateQuestionForm = () => {
    if (!qForm.questionText.trim()) return 'Question text is required'
    if (qForm.options.length < 2) return 'At least 2 options are required'
    for (let i = 0; i < qForm.options.length; i++) {
      if (!qForm.options[i].trim()) return `Option ${String.fromCharCode(65 + i)} cannot be empty`
    }
    if (qForm.correctAnswer < 0 || qForm.correctAnswer >= qForm.options.length) {
      return 'Please select a valid correct answer'
    }
    if (qForm.marks === '' || Number(qForm.marks) < 0) return 'Marks must be a non-negative number'
    return null
  }

  const handleSaveQuestion = async (e) => {
    e.preventDefault()
    setFormError(null)

    const err = validateQuestionForm()
    if (err) {
      setFormError(err)
      return
    }

    setFormSubmitting(true)
    try {
      const payload = {
        questionText: qForm.questionText.trim(),
        options: qForm.options.map((o) => o.trim()),
        correctAnswer: Number(qForm.correctAnswer),
        marks: Number(qForm.marks),
        questionOrder: Number(qForm.questionOrder),
      }

      if (editingQuestion) {
        const qId = editingQuestion._id || editingQuestion.id
        await updateQuestion(qId, payload)
        setFeedback('Question updated successfully.')
      } else {
        await createQuestion(examId, payload)
        setFeedback('Question added successfully.')
      }

      setModalOpen(false)
      dispatch(fetchExams()) // Re-sync exam counts in store
      await loadQuestionsData()
      setTimeout(() => setFeedback(null), 3000)
    } catch (apiErr) {
      setFormError(apiErr.message || 'Failed to save question.')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return
    setIsDeleting(true)
    try {
      const qId = questionToDelete._id || questionToDelete.id
      await deleteQuestion(qId)
      setQuestionToDelete(null)
      setFeedback('Question deleted.')
      dispatch(fetchExams())
      await loadQuestionsData()
      setTimeout(() => setFeedback(null), 3000)
    } catch (delErr) {
      setError(delErr.message || 'Failed to delete question.')
      setQuestionToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const sortedQuestions = [...questions].sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0))

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={adminSidebarLinks} footerLabel={`Signed in as ${user?.role === 'admin' ? 'Admin' : 'Faculty'}`} />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
          <Link
            to={`/admin/exams/${examId}`}
            className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to Exam Overview
          </Link>

          {feedback && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal/30 bg-teal-soft p-3 text-xs text-teal">
              <CheckCircle2 size={15} />
              <span>{feedback}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-coral/30 bg-coral-soft p-3 text-xs text-coral">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Header */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Question Management
              </h1>
              <p className="mt-1 text-sm text-muted">
                {exam ? (
                  <span>
                    Configuring questions for <strong className="text-ink">{exam.title}</strong> ({exam.subject})
                  </span>
                ) : (
                  'Configuring questions'
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="inline-flex items-center gap-1.5 self-start sm:self-auto"
              onClick={openAddModal}
            >
              <Plus size={16} />
              Add Question
            </Button>
          </div>

          {/* Question Count & Marks summary */}
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-paper-raised p-4 text-xs font-medium text-ink-soft">
            <span>
              Total Questions: <strong className="text-ink font-mono">{questions.length}</strong>
            </span>
            <span>•</span>
            <span>
              Total Marks: <strong className="text-ink font-mono">{questions.reduce((sum, q) => sum + (q.marks || 0), 0)}</strong>
            </span>
          </div>

          {/* Questions List */}
          <div className="mt-6 flex flex-col gap-4">
            {loading ? (
              <div className="p-12 text-center text-sm text-muted">Loading questions…</div>
            ) : sortedQuestions.length === 0 ? (
              <div className="rounded-2xl border border-line bg-paper-raised p-12 text-center">
                <p className="text-base font-semibold text-ink">No questions found</p>
                <p className="mt-1 text-sm text-muted">
                  This examination has no questions yet. Candidates cannot take the exam until questions are added.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="mt-4 inline-flex items-center gap-1.5"
                  onClick={openAddModal}
                >
                  <Plus size={14} /> Add First Question
                </Button>
              </div>
            ) : (
              sortedQuestions.map((q, idx) => (
                <div
                  key={q._id || q.id}
                  className="rounded-2xl border border-line bg-paper-raised p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-paper">
                        Question {idx + 1}
                      </span>
                      <span className="rounded-lg border border-line bg-paper px-2 py-1 text-xs font-medium text-ink-soft">
                        {q.marks} mark{q.marks === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(q)}
                        className="focus-ring rounded-lg border border-line bg-paper p-1.5 text-ink-soft hover:bg-paper-raised hover:text-ink"
                        title="Edit Question"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionToDelete(q)}
                        className="focus-ring rounded-lg border border-line bg-paper p-1.5 text-coral hover:border-coral/40 hover:bg-coral-soft"
                        title="Delete Question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium text-ink leading-relaxed">
                    {q.questionText || q.text}
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {(q.options || []).map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswer
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
                            isCorrect
                              ? 'border-teal/60 bg-teal-soft font-medium text-teal'
                              : 'border-line bg-paper text-ink-soft'
                          }`}
                        >
                          <span>
                            <strong className="mr-1.5 font-semibold text-ink">
                              {String.fromCharCode(65 + optIdx)}.
                            </strong>
                            {opt}
                          </span>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-teal px-1.5 py-0.5 text-[10px] font-semibold uppercase text-paper">
                              Correct
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-line bg-paper-raised p-6 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="font-display text-lg font-semibold text-ink">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="focus-ring rounded-lg p-1.5 text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-coral/30 bg-coral-soft p-3 text-xs text-coral">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Question Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={qForm.questionText}
                  onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Which normal form removes partial dependency on a candidate key?"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Options & Correct Answer *
                  </label>
                  <span className="text-xs text-muted">Select radio for correct answer</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {qForm.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={qForm.correctAnswer === optIdx}
                        onChange={() => setQForm({ ...qForm, correctAnswer: optIdx })}
                        className="h-4 w-4 text-teal focus:ring-teal cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="w-6 text-xs font-semibold text-ink-soft">
                        {String.fromCharCode(65 + optIdx)}:
                      </span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                        className={inputClass}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      />
                      {qForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(optIdx)}
                          className="focus-ring rounded-lg p-1.5 text-muted hover:text-coral"
                          title="Remove this option"
                        >
                          <MinusCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {qForm.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="focus-ring mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal hover:underline"
                  >
                    <PlusCircle size={14} /> Add Another Option
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-line">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Marks *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Question Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={qForm.questionOrder}
                    onChange={(e) => setQForm({ ...qForm, questionOrder: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2.5 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Saving…' : editingQuestion ? 'Update Question' : 'Add Question'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Question Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-line bg-paper-raised p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-soft text-coral">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-ink">Delete Question</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Are you sure you want to delete this question?
                </p>
                <p className="mt-2 text-xs italic text-muted line-clamp-2">
                  "{questionToDelete.questionText || questionToDelete.text}"
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setQuestionToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDeleteQuestion}
                disabled={isDeleting}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
