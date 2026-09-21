export default function QuestionNavigator({ total, current, answered, onJump }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Questions</p>
      <div className="mt-3 grid grid-cols-8 gap-2 sm:grid-cols-5">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === current
          const isAnswered = answered.has(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Question ${i + 1}${isAnswered ? ', answered' : ', unanswered'}`}
              aria-current={isCurrent ? 'true' : undefined}
              className={`focus-ring grid h-9 w-9 place-items-center rounded-full font-mono text-xs font-semibold transition-colors ${
                isCurrent
                  ? 'bg-ink text-paper'
                  : isAnswered
                  ? 'bg-teal text-white'
                  : 'border border-line bg-paper text-muted hover:border-ink/30'
              }`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-teal" aria-hidden="true" /> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-line bg-paper" aria-hidden="true" /> Unanswered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink" aria-hidden="true" /> Current
        </span>
      </div>
    </div>
  )
}
