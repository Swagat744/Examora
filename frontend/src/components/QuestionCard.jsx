export default function QuestionCard({ question, index, total, selected, onSelect }) {
  return (
    <div className="neo-card p-4 sm:p-6 md:p-8">
      {/* Editorial Header */}
      <div className="flex items-center justify-between border-b-2 border-line/10 pb-3 sm:pb-4">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Question {index + 1} of {total}
        </span>
        <span className="rounded border-1.5 border-line bg-paper px-2 py-0.5 font-mono text-xs font-semibold text-ink">
          {question.marks || 1} mark{question.marks === 1 ? '' : 's'}
        </span>
      </div>

      <h2 className="mt-4 font-display text-lg sm:text-xl md:text-2xl font-bold leading-snug text-ink break-words">
        {question.text || question.questionText}
      </h2>

      {/* Answer Options Radio Group */}
      <div
        role="radiogroup"
        aria-label={`Answer options for question ${index + 1}`}
        className="mt-5 sm:mt-7 flex flex-col gap-2.5 sm:gap-3"
      >
        {question.options.map((option, i) => {
          const isSelected = selected === i
          const optionLetter = String.fromCharCode(65 + i)

          return (
            <button
              key={`${i}-${option}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(i)}
              className={`focus-ring neo-btn-press flex min-h-[48px] items-center gap-3 rounded-lg border-2 p-3 text-left text-xs sm:text-sm md:text-base font-medium transition-all ${
                isSelected
                  ? 'border-line bg-cobalt text-white shadow-[3px_3px_0px_var(--color-line)]'
                  : 'border-line/40 bg-paper hover:border-line hover:bg-paper-raised text-ink'
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded border-2 font-mono text-xs font-bold ${
                  isSelected
                    ? 'border-white bg-white text-cobalt'
                    : 'border-line bg-paper-raised text-ink'
                }`}
                aria-hidden="true"
              >
                {optionLetter}
              </span>
              <span className="flex-1 min-w-0 break-words leading-relaxed">{option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
