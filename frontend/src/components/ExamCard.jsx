import { Clock, CalendarDays, ListChecks } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatusPill from './StatusPill'
import Button from './Button'

export default function ExamCard({ exam }) {
  const navigate = useNavigate()

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-raised p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_8px_24px_-12px_rgba(20,33,61,0.18)] sm:p-6">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-ink sm:text-lg">{exam.title}</h3>
            <p className="mt-1 text-sm text-muted">{exam.subject}</p>
          </div>
          <StatusPill status={exam.status} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink-soft sm:grid-cols-4">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={15} className="text-muted" aria-hidden="true" />
            <span>{exam.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={15} className="text-muted" aria-hidden="true" />
            <span>{exam.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ListChecks size={15} className="text-muted" aria-hidden="true" />
            <span>{exam.questions} questions</span>
          </div>
          <div className="text-muted">{exam.marks} marks</div>
        </dl>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate(`/student/exam/${exam.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  )
}
