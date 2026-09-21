const toneMap = {
  Upcoming: 'bg-amber-soft text-amber',
  Available: 'bg-teal-soft text-teal',
  Completed: 'bg-ink/8 text-muted',
  Active: 'bg-teal-soft text-teal',
  Scheduled: 'bg-amber-soft text-amber',
  Pass: 'bg-success-soft text-success',
  Fail: 'bg-coral-soft text-coral',
}

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        toneMap[status] || 'bg-ink/8 text-muted'
      }`}
    >
      {status}
    </span>
  )
}
