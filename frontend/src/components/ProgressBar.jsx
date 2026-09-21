export default function ProgressBar({ answered, total }) {
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span>Answered: {answered} / {total}</span>
        <span className="font-mono">{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-teal transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
