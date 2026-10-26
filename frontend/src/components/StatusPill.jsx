const toneMap = {
  Upcoming: 'bg-amber-soft text-amber border-amber',
  Available: 'bg-teal-soft text-teal border-teal',
  Active: 'bg-teal-soft text-teal border-teal',
  Scheduled: 'bg-amber-soft text-amber border-amber',
  Completed: 'bg-paper text-muted border-line',
  Archived: 'bg-paper text-muted border-line',
  Draft: 'bg-paper-raised text-muted border-line-subtle',
  Pass: 'bg-success-soft text-success border-success',
  Fail: 'bg-coral-soft text-coral border-coral',
}

export default function StatusPill({ status }) {
  const displayStatus = status || 'Draft'
  const borderClass = toneMap[displayStatus] || 'bg-paper text-muted border-line'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border-1.5 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${borderClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {displayStatus}
    </span>
  )
}
