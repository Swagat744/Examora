export default function Logo({ className = '', dark = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display font-extrabold tracking-tight ${className}`}>
      <span
        className={`grid h-7 w-7 place-items-center rounded border-2 border-line text-xs font-mono font-bold shadow-[2px_2px_0px_var(--color-line)] ${
          dark ? 'bg-paper text-ink' : 'bg-cobalt text-white'
        }`}
        aria-hidden="true"
      >
        E
      </span>
      <span className="flex items-baseline gap-1">
        <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-paper' : 'text-ink'}`}>
          EXAMORA
        </span>
        <span className="hidden font-mono text-[9px] font-bold text-cobalt sm:inline uppercase">
          // SYS
        </span>
      </span>
    </span>
  )
}
