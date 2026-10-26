import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-ink text-paper border-2 border-line shadow-[3px_3px_0px_var(--color-line)] hover:bg-ink-soft',
  accent:
    'bg-cobalt text-white border-2 border-line shadow-[3px_3px_0px_var(--color-line)] hover:brightness-110',
  teal:
    'bg-teal text-white border-2 border-line shadow-[3px_3px_0px_var(--color-line)] hover:brightness-110',
  outline:
    'bg-paper-raised text-ink border-2 border-line shadow-[3px_3px_0px_var(--color-line)] hover:bg-paper',
  danger:
    'bg-coral text-white border-2 border-line shadow-[3px_3px_0px_var(--color-line)] hover:brightness-110',
  ghost:
    'text-ink border-2 border-transparent hover:border-line hover:bg-paper-raised',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold',
  md: 'px-4 py-2 text-sm font-semibold',
  lg: 'px-5 py-2.5 text-base font-semibold',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses = `focus-ring neo-btn-press inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`

  if (to && !disabled) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {children}
      </Link>
    )
  }

  if (href && !disabled) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" disabled={disabled} className={baseClasses} {...props}>
      {children}
    </button>
  )
}
