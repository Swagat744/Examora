export default function Logo({ className = '', dark = false }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-semibold tracking-tight ${className}`}>
      <span
        className={`grid h-7 w-7 place-items-center rounded-md text-[13px] font-mono font-semibold ${
          dark ? 'bg-paper text-ink' : 'bg-ink text-paper'
        }`}
        aria-hidden="true"
      >
        E
      </span>
      <span className={dark ? 'text-paper' : 'text-ink'}>Examora</span>
    </span>
  )
}
