import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, Clock3, ListChecks, Award } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { fetchExams } from '../redux/slices/examSlice'

const instructions = [
  'Read each question carefully before selecting an answer.',
  'You can navigate freely between questions using Previous, Next, or the question grid.',
  'The examination will automatically submit when the timer reaches zero.',
  'Once submitted, answers cannot be changed.',
]

export default function ExamDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Reads from the same Redux exam list the Student Dashboard already
  // fetched from the API. If the dashboard hasn't loaded yet (e.g. a
  // direct link/refresh straight to this page), fetch it here too —
  // fetchExams is safe to dispatch more than once.
  const exams = useSelector((state) => state.exam.exams)
  const examsStatus = useSelector((state) => state.exam.examsStatus)

  useEffect(() => {
    if (examsStatus === 'idle') {
      dispatch(fetchExams())
    }
  }, [examsStatus, dispatch])

  const exam = useMemo(() => exams.find((e) => String(e.id) === id), [exams, id])

  if (examsStatus === 'loading' || examsStatus === 'idle') {
    return (
      <div>
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 py-14 text-center text-sm text-muted sm:px-8">
          Loading examination…
        </main>
      </div>
    )
  }

  if (!exam) {
    return (
      <div>
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8">
          <p className="text-sm text-muted">This examination could not be found.</p>
          <Link to="/student" className="focus-ring mt-3 inline-block text-sm font-medium text-teal">
            Back to dashboard
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to="/student"
          className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
        </Link>

        <div className="mt-6 rounded-3xl border border-line bg-paper-raised p-6 sm:p-9">
          <p className="text-xs font-medium uppercase tracking-wide text-teal">{exam.subject}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">{exam.title}</h1>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-line py-5 text-center">
            <div>
              <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted">
                <ListChecks size={15} aria-hidden="true" /> Questions
              </dt>
              <dd className="mt-1 font-mono text-xl font-semibold text-ink">{exam.questions}</dd>
            </div>
            <div>
              <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted">
                <Clock3 size={15} aria-hidden="true" /> Duration
              </dt>
              <dd className="mt-1 font-mono text-xl font-semibold text-ink">{exam.duration}m</dd>
            </div>
            <div>
              <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted">
                <Award size={15} aria-hidden="true" /> Marks
              </dt>
              <dd className="mt-1 font-mono text-xl font-semibold text-ink">{exam.marks}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink">Instructions</h2>
            <ul className="mt-3 space-y-2.5">
              {instructions.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="accent"
            size="lg"
            className="mt-8 w-full sm:w-auto"
            onClick={() => navigate(`/student/exam/${exam.id}/attempt`)}
          >
            Start Examination
          </Button>
        </div>
      </main>
    </div>
  )
}
