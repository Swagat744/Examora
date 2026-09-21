const letters = ['A', 'B', 'C', 'D']

export default function QuestionCard({ question, index, total, selected, onSelect }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Question {index + 1} of {total}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
        {question.text}
      </h2>

      <div role="radiogroup" aria-label={`Answer options for question ${index + 1}`} className="mt-6 flex flex-col gap-3">
        {question.options.map((option, i) => {
          const isSelected = selected === i
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(i)}
              className={`focus-ring flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors sm:text-base ${
                isSelected
                  ? 'border-teal bg-teal-soft text-ink'
                  : 'border-line bg-paper hover:border-ink/30'
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-mono font-semibold ${
                  isSelected ? 'border-teal bg-teal text-white' : 'border-line text-muted'
                }`}
                aria-hidden="true"
              >
                {letters[i]}
              </span>
              <span>{option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
