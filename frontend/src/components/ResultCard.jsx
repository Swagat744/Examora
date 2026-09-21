import StatusPill from './StatusPill'

export default function ResultCard({ result }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-paper-raised p-4 sm:p-5">
      <div className="min-w-0">
        <h4 className="truncate font-medium text-ink">{result.exam}</h4>
        <p className="mt-1 text-xs text-muted">{result.date}</p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-right">
          <p className="font-mono text-sm font-semibold text-ink tabular-nums">
            {result.score}/{result.total}
          </p>
          <p className="text-xs text-muted">{result.percentage}%</p>
        </div>
        <StatusPill status={result.status} />
      </div>
    </div>
  )
}
