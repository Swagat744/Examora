import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Clock3, ListChecks, Award, AlertCircle, CheckCircle2, Play } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import StatusPill from '../components/StatusPill'
import { getExamById } from '../services/examService'
import { getMyResults } from '../services/resultService'

const defaultInstructions = [
  'Read each question carefully before selecting an answer.',
  'You can navigate freely between questions using Previous, Next, or the Question Navigator.',
  'The examination will automatically submit when the countdown timer reaches zero.',
  'Once submitted, answers cannot be amended. The server performs definitive grading.',
]

export default function ExamDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const exams = useSelector((state) => state.exam.exams)

  const [exam, setExam] = useState(() => exams.find((e) => String(e.id || e._id) === id) || null)
  const [loading, setLoading] = useState(!exam)
  const [error, setError] = useState(null)
  const [existingAttempt, setExistingAttempt] = useState(null)

  useEffect(() => {
    let cancelled = false
    getExamById(id)
      .then((data) => {
        if (!cancelled) setExam(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load examination specifications.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // Check if the student already completed this exam
    getMyResults()
      .then((results) => {
        if (!cancelled && Array.isArray(results)) {
          const match = results.find(
            (r) => String(r.exam?._id || r.exam?.id || r.exam) === id,
          )
          if (match) setExistingAttempt(match)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-paper swiss-grid-pattern">
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 py-14 text-center font-mono text-sm text-muted">
          LOADING SPECIFICATION DOSSIER…
        </main>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-paper swiss-grid-pattern">
        <Navbar />
        <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
          <div className="neo-card p-8 text-center border-coral bg-coral-soft">
            <AlertCircle size={32} className="mx-auto text-coral" />
            <h2 className="mt-3 font-display text-xl font-bold text-coral">Examination Unavailable</h2>
            <p className="mt-1 font-mono text-xs text-ink-soft">
              {error || 'The requested examination could not be found or has not been published.'}
            </p>
            <div className="mt-6">
              <Button variant="outline" size="sm" to="/student">
                Return to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const instructionsList = exam.instructions
    ? exam.instructions.split('\n').filter((line) => line.trim().length > 0)
    : defaultInstructions

  return (
    <div className="min-h-screen bg-paper swiss-grid-pattern">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-14">
        <Link
          to="/student"
          className="focus-ring inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-ink min-h-[36px]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>BACK TO DASHBOARD</span>
        </Link>

        <div className="neo-card mt-5 p-5 sm:p-9 shadow-[5px_5px_0px_var(--color-line)]">
          {/* Header */}
          <div className="border-b-2 border-line/10 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                {exam.subject} // SPECIFICATION
              </span>
              <StatusPill status={exam.status} />
            </div>

            <h1 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              {exam.title}
            </h1>

            {exam.description && (
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted">
                {exam.description}
              </p>
            )}
          </div>

          {/* Swiss Specs Grid */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 border-b-2 border-line/10 pb-6 text-center">
            <div className="p-2 sm:p-3 bg-paper rounded-lg border-2 border-line/40">
              <dt className="flex items-center justify-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted">
                <ListChecks size={13} className="shrink-0" aria-hidden="true" />
                <span className="truncate">Questions</span>
              </dt>
              <dd className="mt-0.5 sm:mt-1 font-mono text-xl sm:text-2xl font-bold text-ink">
                {exam.numberOfQuestions ?? exam.questions ?? 0}
              </dd>
            </div>

            <div className="p-2 sm:p-3 bg-paper rounded-lg border-2 border-line/40">
              <dt className="flex items-center justify-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted">
                <Clock3 size={13} className="shrink-0" aria-hidden="true" />
                <span className="truncate">Duration</span>
              </dt>
              <dd className="mt-0.5 sm:mt-1 font-mono text-xl sm:text-2xl font-bold text-ink">
                {exam.duration}m
              </dd>
            </div>

            <div className="p-2 sm:p-3 bg-paper rounded-lg border-2 border-line/40">
              <dt className="flex items-center justify-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted">
                <Award size={13} className="shrink-0" aria-hidden="true" />
                <span className="truncate">Marks</span>
              </dt>
              <dd className="mt-0.5 sm:mt-1 font-mono text-xl sm:text-2xl font-bold text-ink">
                {exam.totalMarks ?? exam.marks ?? 0}
              </dd>
            </div>
          </div>

          {/* Existing attempt notification */}
          {existingAttempt && (
            <div className="mt-6 rounded-lg border-2 border-teal bg-teal-soft p-4 shadow-[2px_2px_0px_var(--color-teal)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-teal" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal">
                  ATTEMPT RECORDED // GRADED
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                You scored <strong className="font-mono font-bold">{existingAttempt.score} / {existingAttempt.totalMarks}</strong> ({existingAttempt.percentage}%) on this examination.
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" to="/student/results">
                  View Evaluated Results
                </Button>
              </div>
            </div>
          )}

          {/* Instructions Block */}
          <div className="mt-6">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
              EXAMINATION PROTOCOLS & INSTRUCTIONS
            </h2>
            <ul className="mt-3 space-y-2.5">
              {instructionsList.map((line, idx) => (
                <li key={idx} className="flex gap-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
                  <span className="font-mono text-xs font-bold text-cobalt shrink-0">
                    {idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Row */}
          <div className="mt-8 border-t-2 border-line/10 pt-6">
            {existingAttempt ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                to="/student/results"
              >
                VIEW MY SCORECARD
              </Button>
            ) : (
              <Button
                variant="accent"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/student/exam/${exam.id || exam._id}/attempt`)}
              >
                <Play size={16} />
                <span>START EXAMINATION</span>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
