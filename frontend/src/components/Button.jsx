import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  accent: 'bg-teal text-white hover:bg-teal/90',
  outline: 'border border-line bg-paper-raised text-ink hover:border-ink/40',
  ghost: 'text-ink hover:bg-ink/5',
}

const sizes = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
  sm: 'px-3.5 py-2 text-sm',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  ...props
}) {
  const classes = `focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
