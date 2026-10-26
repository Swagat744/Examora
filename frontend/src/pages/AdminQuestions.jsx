import { useEffect, useState, useCallback } from 'react'
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
  Lock,
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
  'focus-ring w-full rounded-lg border-2 border-line bg-paper px-3 py-2 font-sans text-xs sm:text-sm font-medium text-ink placeholder:text-muted focus-visible:border-cobalt transition-colors'

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
  const [editingQuestion, setEditingQuestion] = useState(null)
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

  const loadQuestionsData = useCallback(async () => {
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
  }, [examId])

  useEffect(() => {
    loadQuestionsData()
  }, [loadQuestionsData])

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
    const opts = Array.isArray(q.options) && q.options.length >= 2 ? [...q.options] : ['', '']
    let parsedCorrect = typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(q.correctAnswer)
    if (isNaN(parsedCorrect) || parsedCorrect < 0 || parsedCorrect >= opts.length) {
      parsedCorrect = 0
    }
    setQForm({
      questionText: q.questionText || q.text || '',
      options: opts,
      correctAnswer: parsedCorrect,
      marks: q.marks !== undefined ? q.marks : 1,
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
      if (prev.correctAnswer === index) {
        // The selected correct option was removed; require user to choose a valid replacement
        newCorrect = -1
      } else if (prev.correctAnswer > index) {
        // An option preceding the selected answer was removed; adjust index to preserve selection
        newCorrect = prev.correctAnswer - 1
      }
      return { ...prev, options: newOpts, correctAnswer: newCorrect }
    })
  }

  const validateQuestionForm = () => {
    if (!qForm.questionText.trim()) return 'Question text is required'
    if (qForm.options.length < 2) return 'At least 2 options are required'
    for (let i = 0; i < qForm.options.length; i++) {
      if (!qForm.options[i].trim()) return `Option ${String.fromCharCode(65 + i)} cannot be empty`
    }
    if (
      qForm.correctAnswer === null ||
      qForm.correctAnswer === undefined ||
      !Number.isInteger(Number(qForm.correctAnswer)) ||
      Number(qForm.correctAnswer) < 0 ||
      Number(qForm.correctAnswer) >= qForm.options.length
    ) {
      return 'Please select a valid correct answer choice'
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
      dispatch(fetchExams())
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

  const isLocked = Boolean(exam?.attemptCount && exam.attemptCount > 0)
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
            to={`/admin/exams/${examId}`}
            className="focus-ring inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-ink"
          >
            <ArrowLeft size={14} />
            <span>BACK TO OVERVIEW</span>
          </Link>

          {feedback && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-teal bg-teal-soft p-3 font-mono text-xs font-bold text-teal shadow-[2px_2px_0px_var(--color-teal)]">
              <CheckCircle2 size={16} />
              <span>{feedback}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border-2 border-coral bg-coral-soft p-3 font-mono text-xs font-bold text-coral shadow-[2px_2px_0px_var(--color-coral)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLocked && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border-2 border-amber bg-amber-soft p-4 font-mono text-xs text-amber shadow-[2px_2px_0px_var(--color-amber)]">
              <Lock size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block uppercase tracking-wider">QUESTIONS LOCKED: INTEGRITY PROTECTED</strong>
                {exam.attemptCount} candidate attempt{exam.attemptCount === 1 ? '' : 's'} recorded. Modifying or deleting questions is blocked by the backend to prevent historical grade alteration.
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mt-6 flex flex-col gap-4 border-b-2 border-line/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                QUESTION BANK AUTHORING // {exam?.title || 'EXAM'}
              </span>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Question Repository
              </h1>
              <p className="mt-1 font-mono text-xs text-muted">
                {questions.length} question{questions.length === 1 ? '' : 's'} authored &bull; {exam?.totalMarks || 0} total marks
              </p>
            </div>

            {canModify && !isLocked && (
              <Button
                type="button"
                variant="accent"
                size="md"
                onClick={openAddModal}
              >
                <Plus size={16} />
                <span>AUTHOR QUESTION</span>
              </Button>
            )}
          </div>

          {/* Question List */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="neo-card p-8 text-center font-mono text-xs text-muted animate-pulse">
                LOADING QUESTION BANK…
              </div>
            ) : questions.length === 0 ? (
              <div className="neo-card p-12 text-center">
                <p className="font-display text-base font-bold text-ink">No questions in this repository yet</p>
                <p className="mt-1 font-mono text-xs text-muted">Begin authoring questions to populate the examination bank.</p>
                {canModify && !isLocked && (
                  <Button variant="accent" size="sm" className="mt-4" onClick={openAddModal}>
                    Author First Question
                  </Button>
                )}
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q._id || q.id || idx} className="neo-card p-5 sm:p-6 shadow-[3px_3px_0px_var(--color-line)]">
                  <div className="flex items-start justify-between gap-3 border-b-2 border-line/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded border-2 border-line bg-paper font-mono text-xs font-bold text-ink">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                        QUESTION #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded border-1.5 border-line bg-paper px-2 py-0.5 font-mono text-xs font-bold text-ink">
                        {q.marks || 1} mark{q.marks === 1 ? '' : 's'}
                      </span>

                      {canModify && !isLocked && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(q)}
                            className="focus-ring neo-btn-press rounded border border-line bg-paper p-1 text-muted hover:text-ink hover:bg-paper-raised"
                            title="Edit Question"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestionToDelete(q)}
                            className="focus-ring neo-btn-press rounded border border-line bg-paper p-1 text-coral hover:bg-coral-soft"
                            title="Delete Question"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-4 font-display text-base font-bold text-ink">
                    {q.questionText || q.text}
                  </h3>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {q.options?.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === optIdx
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2.5 rounded-lg border-2 p-2.5 font-mono text-xs ${
                            isCorrect
                              ? 'border-teal bg-teal-soft font-bold text-teal shadow-[2px_2px_0px_var(--color-teal)]'
                              : 'border-line/40 bg-paper text-ink-soft'
                          }`}
                        >
                          <span
                            className={`grid h-5 w-5 place-items-center rounded border font-mono text-[10px] font-bold ${
                              isCorrect ? 'border-teal bg-teal text-white' : 'border-line bg-paper-raised'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 truncate">{opt}</span>
                          {isCorrect && <CheckCircle2 size={14} className="shrink-0" />}
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

      {/* Author / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto">
          <div className="neo-card my-8 w-full max-w-xl p-6 sm:p-7 shadow-[6px_6px_0px_var(--color-line)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                {editingQuestion ? 'QUESTION EDITOR' : 'NEW QUESTION SPEC'}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="focus-ring rounded p-1 hover:bg-paper"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded border-2 border-coral bg-coral-soft p-3 font-mono text-xs font-bold text-coral">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  Question Text *
                </label>
                <textarea
                  required
                  rows="3"
                  value={qForm.questionText}
                  onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                  className={inputClass}
                  placeholder="Formulate the question prompt here…"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Marks Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={qForm.questionOrder}
                    onChange={(e) => setQForm({ ...qForm, questionOrder: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Options & Authoritative Key ({qForm.options.length}/8)
                  </span>
                  {qForm.options.length < 8 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="font-mono text-[11px] font-bold uppercase text-cobalt hover:underline inline-flex items-center gap-1"
                    >
                      <PlusCircle size={13} /> Add Choice
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {qForm.options.map((opt, idx) => {
                    const isKey = qForm.correctAnswer === idx
                    const letter = String.fromCharCode(65 + idx)
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQForm({ ...qForm, correctAnswer: idx })}
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded border-2 font-mono text-xs font-bold transition-all ${
                            isKey
                              ? 'border-teal bg-teal text-white shadow-[2px_2px_0px_var(--color-teal)]'
                              : 'border-line bg-paper text-muted hover:border-ink'
                          }`}
                          title={`Select option ${letter} as correct key`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${letter} formulation`}
                          className={inputClass}
                        />
                        {qForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="p-1.5 text-muted hover:text-coral"
                            title="Remove choice"
                          >
                            <MinusCircle size={16} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 font-mono text-[10px] text-muted">
                  Click the letter circle to set the correct answer key.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-line/10 pt-4">
                <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  CANCEL
                </Button>
                <Button type="submit" variant="accent" size="sm" disabled={formSubmitting}>
                  {formSubmitting ? 'PERSISTING…' : editingQuestion ? 'SAVE MODIFICATIONS' : 'RECORD QUESTION'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="neo-card w-full max-w-md p-6 sm:p-7 shadow-[6px_6px_0px_var(--color-line)]">
            <div className="flex items-center gap-2.5 border-b-2 border-line/10 pb-3 text-coral">
              <AlertTriangle size={20} />
              <h3 className="font-display text-lg font-bold">Delete Question</h3>
            </div>

            <p className="mt-4 font-mono text-xs leading-relaxed text-ink-soft">
              Are you sure you want to delete this question? The examination's total marks and question count will be re-synchronized automatically.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-line/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestionToDelete(null)}
                disabled={isDeleting}
              >
                CANCEL
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteQuestion}
                disabled={isDeleting}
              >
                {isDeleting ? 'DELETING…' : 'CONFIRM DELETE'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
