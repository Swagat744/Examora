const toneMap = {
  teal: 'text-teal',
  amber: 'text-amber',
  success: 'text-success',
  ink: 'text-ink',
}

export default function StatCard({ label, value, tone = 'ink' }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-paper-raised p-5">
      <div
        className={`bubble-grid pointer-events-none absolute -right-3 -top-3 h-16 w-16 opacity-[0.07] ${toneMap[tone]}`}
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${toneMap[tone]}`}>
        {String(value).padStart(2, '0')}
      </p>
    </div>
  )
}
