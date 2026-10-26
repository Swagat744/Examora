import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Timer, AlarmClockOff, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Send, AlertTriangle } from 'lucide-react'
import QuestionCard from '../components/QuestionCard'
import QuestionNavigator from '../components/QuestionNavigator'
import ProgressBar from '../components/ProgressBar'
import Button from '../components/Button'
import { useExamTimer } from '../hooks/useExamTimer'
import { getQuestionsForExam, getExamById } from '../services/examService'
import { submitAttempt } from '../services/resultService'
import {
  loadQuestions,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  selectAnswer,
} from '../redux/slices/questionSlice'
import { selectExam, setExamStatus } from '../redux/slices/examSlice'

export default function ExamInterface() {
  const { id } = useParams()
  const dispatch = useDispatch()

  const exams = useSelector((state) => state.exam.exams)
  const reduxExam = exams.find((e) => String(e.id || e._id) === id)

  const [exam, setExam] = useState(reduxExam || null)
  const [examLoading, setExamLoading] = useState(!reduxExam)

  // Ensure exam is loaded even on hard reload or direct URL
  useEffect(() => {
    let cancelled = false
    if (!exam) {
      setExamLoading(true)
      getExamById(id)
        .then((data) => {
          if (!cancelled) {
            setExam(data)
            dispatch(selectExam(data))
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setExamLoading(false)
        })
    }
    return () => {
      cancelled = true
    }
  }, [id, exam, dispatch])

  const { questions, currentQuestionIndex, answers } = useSelector((state) => state.questions)
  const [questionsStatus, setQuestionsStatus] = useState('idle')
  const [questionsError, setQuestionsError] = useState(null)

  // Calculate dynamic duration in seconds with persistent storage key
  const durationSeconds = (exam?.duration || 30) * 60
  const timerStorageKey = `examora_active_exam_${id}`

  const { minutes, seconds, timeLeft, isFinished, clear: clearTimer } = useExamTimer(
    durationSeconds,
    timerStorageKey,
  )

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Escape key listener for confirmation modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showConfirmModal) {
        setShowConfirmModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showConfirmModal])

  // Fetch questions once exam metadata is ready
  useEffect(() => {
    if (!exam) return
    dispatch(setExamStatus('in-progress'))

    setQuestionsStatus('loading')
    getQuestionsForExam(exam.id || exam._id)
      .then((data) => {
        dispatch(loadQuestions(data))
        setQuestionsStatus('succeeded')
      })
      .catch((err) => {
        setQuestionsError(err.message || 'Failed to load questions.')
        setQuestionsStatus('failed')
      })
  }, [dispatch, exam])

  const question = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const answeredSet = new Set(Object.keys(answers).map(Number))

  const handleSelectAnswer = (optionIndex) => {
    dispatch(selectAnswer({ questionIndex: currentQuestionIndex, optionIndex }))
  }

  const handleSubmit = async () => {
    if (isSubmitting || submitted) return
    setIsSubmitting(true)
    setSubmitError('')

    const payload = {}
    questions.forEach((q, idx) => {
      if (idx in answers) payload[q.id || q._id] = answers[idx]
    })

    try {
      const attempt = await submitAttempt(exam.id || exam._id, {
        answers: payload,
      })
      dispatch(setExamStatus('submitted'))
      clearTimer()
      setResult(attempt)
      setSubmitted(true)
      setShowConfirmModal(false)
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit examination.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-submit on countdown expiry
  useEffect(() => {
    if (isFinished && !submitted && !isSubmitting && questions.length > 0) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished])

  // Evaluated result display screen
  if (submitted && result) {
    const isTimeUp = isFinished
    const percentage = result.percentage ?? 0
    const isPassed = percentage >= 40

    return (
      <div className="grid min-h-screen place-items-center bg-paper swiss-grid-pattern p-5">
        <div className="neo-card w-full max-w-lg p-6 sm:p-9 shadow-[6px_6px_0px_var(--color-line)] text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border-2 border-line bg-teal text-white shadow-[2px_2px_0px_var(--color-line)]">
            {isTimeUp ? <AlarmClockOff size={24} /> : <CheckCircle2 size={24} />}
          </div>

          <span className="mt-4 inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
            SESSION TERMINATED // GRADED
          </span>

          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            {isTimeUp ? "Time Expired — Exam Submitted" : "Examination Completed"}
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-muted">
            Your responses have been validated against the authoritative key stored in the secure database.
          </p>

          {/* Swiss Scorecard Dossier */}
          <div className="mt-6 rounded-lg border-2 border-line bg-paper p-5 text-left">
            <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">FINAL SCORE</span>
              <span className="font-mono text-2xl font-extrabold text-ink tabular-nums">
                {result.score} / {result.totalMarks}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="rounded border border-line bg-paper-raised p-2">
                <span className="block text-[10px] font-bold text-teal uppercase">Correct</span>
                <span className="font-bold text-ink">{result.correctCount}</span>
              </div>
              <div className="rounded border border-line bg-paper-raised p-2">
                <span className="block text-[10px] font-bold text-coral uppercase">Incorrect</span>
                <span className="font-bold text-ink">{result.incorrectCount}</span>
              </div>
              <div className="rounded border border-line bg-paper-raised p-2">
                <span className="block text-[10px] font-bold text-muted uppercase">Unanswered</span>
                <span className="font-bold text-ink">{result.unansweredCount}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-muted font-bold uppercase">PERCENTAGE</span>
              <span className="font-extrabold text-ink">{percentage}% ({isPassed ? 'PASS' : 'FAIL'})</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button
              variant="accent"
              size="md"
              className="flex-1"
              to="/student/results"
            >
              GO TO MY SCORECARDS
            </Button>
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              to="/student"
            >
              STUDENT DASHBOARD
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (examLoading || questionsStatus === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-paper swiss-grid-pattern font-mono text-sm text-muted">
        INITIALIZING CANDIDATE TERMINAL…
      </div>
    )
  }

  if (questionsStatus === 'failed') {
    return (
      <div className="grid min-h-screen place-items-center bg-paper swiss-grid-pattern p-5">
        <div className="neo-card max-w-md p-6 text-center border-coral bg-coral-soft">
          <AlertCircle size={32} className="mx-auto text-coral" />
          <h2 className="mt-3 font-display text-xl font-bold text-coral">Terminal Error</h2>
          <p className="mt-1 font-mono text-xs text-ink-soft">
            {questionsError || 'Questions could not be retrieved from the server.'}
          </p>
          <div className="mt-5">
            <Button variant="outline" size="sm" to="/student">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isUrgentTimer = timeLeft <= 300 // 5 minutes or less

  return (
    <div className="min-h-screen bg-paper swiss-grid-pattern">
      {/* Distraction-Free Header */}
      <header className="sticky top-0 z-40 border-b-2 border-line bg-paper-raised/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 h-auto py-2.5 max-w-6xl items-center justify-between px-3 sm:px-8 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to="/student"
              className="focus-ring neo-btn-press rounded border-2 border-line bg-paper p-1.5 text-ink hover:bg-paper-raised shrink-0 inline-flex min-h-[36px] min-w-[36px] items-center justify-center"
              title="Leave examination (answers preserved)"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <span className="block font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cobalt truncate">
                {exam?.subject || 'ACADEMIC EXAM'}
              </span>
              <h1 className="font-display text-xs sm:text-base font-bold text-ink truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
                {exam?.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border-2 px-2.5 sm:px-3 py-1 font-mono text-xs sm:text-sm font-bold tabular-nums shadow-[2px_2px_0px_var(--color-line)] ${
                isUrgentTimer
                  ? 'border-coral bg-coral text-white animate-pulse'
                  : 'border-line bg-ink text-paper'
              }`}
            >
              <Timer size={14} className="shrink-0" />
              <span>{minutes}:{seconds}</span>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="min-h-[36px] px-2.5 sm:px-3"
            >
              <Send size={13} />
              <span>SUBMIT</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Examination View */}
      <main className="mx-auto max-w-6xl px-3.5 py-5 sm:px-8 sm:py-8">
        {/* Progress Tracker */}
        <div className="mb-5 sm:mb-6">
          <ProgressBar answered={answeredCount} total={questions.length} />
        </div>

        {submitError && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border-2 border-coral bg-coral-soft p-3 text-xs font-semibold text-coral shadow-[2px_2px_0px_var(--color-coral)]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Active Question Box */}
          <section className="min-w-0">
            {question ? (
              <QuestionCard
                question={question}
                index={currentQuestionIndex}
                total={questions.length}
                selected={answers[currentQuestionIndex]}
                onSelect={handleSelectAnswer}
              />
            ) : (
              <div className="neo-card p-8 text-center font-mono text-sm text-muted">
                No question available at this index.
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="mt-6 flex items-center justify-between gap-2 border-t-2 border-line/10 pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => dispatch(previousQuestion())}
                disabled={currentQuestionIndex === 0}
                className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
              >
                <ArrowLeft size={16} />
                <span>PREVIOUS</span>
              </Button>

              {isLastQuestion ? (
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                  className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
                >
                  <span>FINAL REVIEW</span>
                  <CheckCircle2 size={16} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => dispatch(nextQuestion())}
                  className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
                >
                  <span>NEXT QUESTION</span>
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </section>

          {/* Navigator Sidebar */}
          <aside className="min-w-0">
            <QuestionNavigator
              total={questions.length}
              current={currentQuestionIndex}
              answered={answeredSet}
              onJump={(index) => dispatch(goToQuestion(index))}
            />
          </aside>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div
            className="absolute inset-0"
            onClick={() => setShowConfirmModal(false)}
            aria-hidden="true"
          />
          <div className="neo-card relative z-10 w-full max-w-md p-5 sm:p-7 shadow-[6px_6px_0px_var(--color-line)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 border-b-2 border-line/10 pb-3 text-ink">
              <AlertTriangle size={18} className="text-amber" />
              <h3 className="font-display text-lg font-bold">Confirm Final Submission</h3>
            </div>

            <div className="mt-4 font-mono text-xs text-ink-soft space-y-2">
              <p>You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.</p>
              {answeredCount < questions.length && (
                <p className="text-amber font-semibold">
                  Warning: {questions.length - answeredCount} question{questions.length - answeredCount === 1 ? '' : 's'} remain unanswered.
                </p>
              )}
              <p className="text-muted">Once submitted, your answers are sealed and graded immediately.</p>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t-2 border-line/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                RETURN TO EXAM
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SUBMITTING…' : 'YES, SUBMIT ANSWERS'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
