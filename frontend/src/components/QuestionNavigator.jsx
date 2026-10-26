export default function QuestionNavigator({ total, current, answered, onJump }) {
  return (
    <div className="neo-card p-5">
      <div className="flex items-center justify-between border-b-2 border-line/10 pb-3">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Navigator
        </p>
        <span className="font-mono text-xs font-semibold text-ink">
          {answered.size} / {total} answered
        </span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-5">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === current
          const isAnswered = answered.has(i)

          let btnClass = 'border-line/40 bg-paper text-muted hover:border-line'
          if (isCurrent) {
            btnClass = 'border-line bg-ink text-paper shadow-[2px_2px_0px_var(--color-line)] scale-105'
          } else if (isAnswered) {
            btnClass = 'border-line bg-teal text-white shadow-[2px_2px_0px_var(--color-line)]'
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Question ${i + 1}${isAnswered ? ', answered' : ', unanswered'}`}
              aria-current={isCurrent ? 'true' : undefined}
              className={`focus-ring grid h-10 w-full place-items-center rounded border-2 font-mono text-xs font-bold transition-all ${btnClass}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Swiss Legend */}
      <div className="mt-5 flex flex-col gap-2 border-t-2 border-line/10 pt-3 text-[11px] font-mono text-muted">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-line bg-teal" aria-hidden="true" />
            Answered
          </span>
          <span className="font-semibold text-ink">{answered.size}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-line/50 bg-paper" aria-hidden="true" />
            Unanswered
          </span>
          <span className="font-semibold text-ink">{total - answered.size}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-line bg-ink" aria-hidden="true" />
            Current Focus
          </span>
          <span className="font-semibold text-ink">#{current + 1}</span>
        </div>
      </div>
    </div>
  )
}
