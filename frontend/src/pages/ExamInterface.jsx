import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Timer, AlarmClockOff, CheckCircle2, AlertCircle } from 'lucide-react'
import QuestionCard from '../components/QuestionCard'
import QuestionNavigator from '../components/QuestionNavigator'
import ProgressBar from '../components/ProgressBar'
import Button from '../components/Button'
import { useExamTimer } from '../hooks/useExamTimer'
import { getQuestionsForExam } from '../services/examService'
import { submitAttempt } from '../services/resultService'
import {
  loadQuestions,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  selectAnswer,
} from '../redux/slices/questionSlice'
import { selectExam, setExamStatus, fetchExams } from '../redux/slices/examSlice'

const TOTAL_SECONDS = 30 * 60

export default function ExamInterface() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // The exam's title/subject comes from the API-backed list in Redux.
  const exams = useSelector((state) => state.exam.exams)
  const examsStatus = useSelector((state) => state.exam.examsStatus)
  const exam = exams.find((e) => String(e.id) === id)

  useEffect(() => {
    if (examsStatus === 'idle') dispatch(fetchExams())
  }, [examsStatus, dispatch])

  // Questions, current index, and answers live in Redux — the question
  // card, navigator, and progress bar all need this same state. The
  // questions themselves are now fetched from the real backend
  // (GET /api/exams/:examId/questions) instead of local mock data, and
  // correctAnswer never reaches the frontend at all — grading happens
  // entirely server-side in submitAttempt below.
  const { questions, currentQuestionIndex, answers } = useSelector((state) => state.questions)
  const [questionsStatus, setQuestionsStatus] = useState('idle')

  const startedAtRef = useRef(new Date().toISOString())

  useEffect(() => {
    if (!exam) return
    dispatch(selectExam(exam))
    dispatch(setExamStatus('in-progress'))

    setQuestionsStatus('loading')
    getQuestionsForExam(exam.id)
      .then((data) => {
        dispatch(loadQuestions(data))
        setQuestionsStatus('succeeded')
      })
      .catch(() => setQuestionsStatus('failed'))
  }, [dispatch, exam])

  // Timer stays a local custom hook — it belongs to this component only,
  // Redux does not need to know about the interval ticking every second.
  const { minutes, seconds, timeLeft, isFinished } = useExamTimer(TOTAL_SECONDS)

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)

  const question = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const answeredSet = new Set(Object.keys(answers).map(Number))

  const handleSelectAnswer = (optionIndex) => {
    dispatch(selectAnswer({ questionIndex: currentQuestionIndex, optionIndex }))
  }

  // Submitting begins → button disables immediately (isSubmitting) so a
  // double-click or the auto-submit-on-timeout can't fire two requests.
  // The backend additionally rejects a second attempt for the same
  // student/exam pair at the database level (unique index on Attempt),
  // so duplicate submission is blocked on both ends, not just the UI.
  const handleSubmit = async () => {
    if (isSubmitting || submitted) return
    setIsSubmitting(true)
    setSubmitError('')

    // Only the student's picks are sent, keyed by the real question id —
    // never a score, never a "correct" flag.
    const payload = {}
    questions.forEach((q, idx) => {
      if (idx in answers) payload[q.id] = answers[idx]
    })

    try {
      const attempt = await submitAttempt(exam.id, {
        answers: payload,
        startedAt: startedAtRef.current,
      })
      dispatch(setExamStatus('submitted'))
      setResult(attempt)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit examination.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToResults = () => navigate('/student/results')

  // Time ran out — auto-submit.
  useEffect(() => {
    if (isFinished && !submitted && !isSubmitting) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished])

  if (submitted && result) {
    const isTimeUp = isFinished
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-5">
        <div className="w-full max-w-sm rounded-3xl border border-line bg-paper-raised p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-soft text-teal">
            {isTimeUp ? <AlarmClockOff size={22} aria-hidden="true" /> : <CheckCircle2 size={22} aria-hidden="true" />}
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
            {isTimeUp ? "Time's Up!" : 'Examination Submitted'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Your examination has been evaluated.
          </p>

          <div className="mt-5 rounded-xl border border-line bg-paper p-4 text-left text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Score</span>
              <span className="font-mono font-semibold text-ink">
                {result.score} / {result.totalMarks}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-muted">Percentage</span>
              <span className="font-mono font-semibold text-teal">{result.percentage}%</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
              <div>
                <p className="font-mono font-semibold text-success">{result.correctCount}</p>
                <p className="text-xs text-muted">Correct</p>
              </div>
              <div>
                <p className="font-mono font-semibold text-coral">{result.incorrectCount}</p>
                <p className="text-xs text-muted">Incorrect</p>
              </div>
              <div>
                <p className="font-mono font-semibold text-muted">{result.unansweredCount}</p>
                <p className="text-xs text-muted">Unanswered</p>
              </div>
            </div>
          </div>

          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={goToResults}>
            View Result
          </Button>
        </div>
      </div>
    )
  }

  if (!exam || questionsStatus === 'loading' || questionsStatus === 'idle') {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <p className="text-sm text-muted">Loading examination…</p>
      </div>
    )
  }

  if (questionsStatus === 'failed') {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle size={20} className="text-coral" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">Unable to load this examination.</p>
          <p className="text-sm text-muted">Please try again.</p>
        </div>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Examination</p>
            <p className="font-display text-sm font-semibold text-ink sm:text-base">{exam.title}</p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-semibold tabular-nums ${
              timeLeft < 60 ? 'bg-coral-soft text-coral' : 'bg-ink text-paper'
            }`}
            role="timer"
            aria-live="polite"
          >
            <Timer size={17} aria-hidden="true" />
            {minutes}:{seconds}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="mb-6">
          <ProgressBar answered={answeredCount} total={questions.length} />
        </div>

        {submitError && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-coral/30 bg-coral-soft p-3 text-sm text-coral">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div>
            <QuestionCard
              question={question}
              index={currentQuestionIndex}
              total={questions.length}
              selected={answers[currentQuestionIndex]}
              onSelect={handleSelectAnswer}
            />

            <div className="mt-5 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => dispatch(previousQuestion())}
                disabled={currentQuestionIndex === 0}
                className="disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button variant="accent" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>
              ) : (
                <Button variant="primary" onClick={() => dispatch(nextQuestion())}>
                  Next
                </Button>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <QuestionNavigator
              total={questions.length}
              current={currentQuestionIndex}
              answered={answeredSet}
              onJump={(i) => dispatch(goToQuestion(i))}
            />
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : 'Submit examination'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
