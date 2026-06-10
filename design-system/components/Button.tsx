import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-pitch-600 text-white hover:bg-pitch-500 active:bg-pitch-700 disabled:opacity-40',
  gold:    'bg-gold-400 text-pitch-950 font-bold hover:bg-gold-300 active:bg-gold-500 disabled:opacity-40',
  outline: 'border border-border text-text-primary hover:bg-pitch-800 active:bg-pitch-700 disabled:opacity-40',
  ghost:   'text-pitch-400 hover:bg-pitch-800 active:bg-pitch-700 disabled:opacity-40',
  danger:  'bg-red-950 text-red-300 hover:bg-red-900 active:bg-red-950 disabled:opacity-40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs rounded-md min-h-[36px]',
  md: 'px-5 py-2.5 text-sm rounded-lg min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-lg min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-all duration-base ease-out',
        'focus-visible:outline-2 focus-visible:outline-pitch-400 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
