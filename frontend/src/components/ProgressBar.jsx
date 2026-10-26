export default function ProgressBar({ answered, total }) {
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between font-mono text-xs font-semibold text-ink">
        <span>PROGRESS: {answered} / {total} COMPLETED</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div
        className="mt-2 h-2.5 w-full overflow-hidden rounded-md border-2 border-line bg-paper"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-cobalt transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
