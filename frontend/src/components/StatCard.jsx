export default function StatCard({ label, value, subtext }) {
  return (
    <div className="neo-card relative overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
          {label}
        </p>
        <span className="h-2 w-2 rounded-sm bg-line" aria-hidden="true" />
      </div>

      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-ink tabular-nums sm:text-4xl">
        {typeof value === 'number' && value < 10 && value >= 0 ? `0${value}` : value}
      </p>

      {subtext && (
        <p className="mt-2 text-xs font-medium text-muted">
          {subtext}
        </p>
      )}
    </div>
  )
}
