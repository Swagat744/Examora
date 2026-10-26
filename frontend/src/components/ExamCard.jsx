import { Clock, CalendarDays, ListChecks, Award, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatusPill from './StatusPill'
import Button from './Button'

export default function ExamCard({ exam }) {
  const navigate = useNavigate()

  return (
    <div className="neo-card-interactive flex flex-col justify-between p-5 sm:p-6">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-cobalt">
              {exam.subject}
            </span>
            <h3 className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">
              {exam.title}
            </h3>
          </div>
          <StatusPill status={exam.status} />
        </div>

        {exam.description && (
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted">
            {exam.description}
          </p>
        )}

        {/* Swiss Metadata Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 border-y-2 border-line/10 py-3 text-xs sm:grid-cols-4">
          <div className="flex items-center gap-1.5 font-medium text-ink-soft">
            <CalendarDays size={14} className="text-muted shrink-0" aria-hidden="true" />
            <span className="truncate">{exam.date || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-ink-soft">
            <Clock size={14} className="text-muted shrink-0" aria-hidden="true" />
            <span>{exam.duration}m duration</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-ink-soft">
            <ListChecks size={14} className="text-muted shrink-0" aria-hidden="true" />
            <span>{exam.questions} questions</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-ink-soft">
            <Award size={14} className="text-muted shrink-0" aria-hidden="true" />
            <span>{exam.marks} total marks</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => navigate(`/student/exam/${exam.id}`)}
        >
          <span>Examine Specifications</span>
          <ArrowUpRight size={15} />
        </Button>
      </div>
    </div>
  )
}
