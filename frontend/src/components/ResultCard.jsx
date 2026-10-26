import StatusPill from './StatusPill'
import { Calendar } from 'lucide-react'

export default function ResultCard({ result }) {
  const percentage = result.percentage ?? 0
  const isPassed = percentage >= 40
  const statusLabel = isPassed ? 'Pass' : 'Fail'

  const examTitle = typeof result.exam === 'object' ? result.exam?.title : result.exam || 'Examination'
  const examSubject = typeof result.exam === 'object' ? result.exam?.subject : ''
  const formattedDate = result.submittedAt
    ? new Date(result.submittedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : result.date || 'Completed'

  return (
    <div className="neo-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {examSubject && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cobalt">
              {examSubject}
            </span>
          )}
          <h4 className="truncate font-display text-base font-bold text-ink sm:text-lg">
            {examTitle}
          </h4>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted">
            <Calendar size={13} aria-hidden="true" />
            <span>{formattedDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 border-t-2 border-line/10 pt-3 sm:border-t-0 sm:pt-0">
          <div className="text-right">
            <p className="font-mono text-lg font-bold text-ink tabular-nums sm:text-xl">
              {result.score} <span className="text-xs text-muted">/ {result.totalMarks || result.total}</span>
            </p>
            <p className="font-mono text-xs font-semibold text-muted">
              {percentage}%
            </p>
          </div>
          <StatusPill status={statusLabel} />
        </div>
      </div>
    </div>
  )
}
