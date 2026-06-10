import { clsx } from 'clsx'

type BadgeVariant = 'live' | 'upcoming' | 'finished' | 'exact' | 'correct' | 'wrong' | 'streak'

const variants: Record<BadgeVariant, string> = {
  live:     'bg-red-950 text-red-300 animate-pulse-live',
  upcoming: 'bg-[#1c3451] text-blue-300',
  finished: 'bg-[#1c3326] text-green-300',
  exact:    'bg-gold-950 text-gold-200',
  correct:  'bg-grass-950 text-grass-300',
  wrong:    'bg-pitch-800 text-text-muted',
  streak:   'bg-[#4c0519] text-pink-300',
}

const labels: Record<BadgeVariant, string> = {
  live:     '● LIVE',
  upcoming: '🕐',
  finished: '✓ Terminé',
  exact:    '🏆 Score exact',
  correct:  '✓ Bon résultat',
  wrong:    '✗',
  streak:   '🔥',
}

interface BadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'text-xs font-semibold leading-none',
        variants[variant],
        className,
      )}
    >
      {children ?? labels[variant]}
    </span>
  )
}
