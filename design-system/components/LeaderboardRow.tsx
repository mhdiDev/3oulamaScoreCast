import { clsx } from 'clsx'

interface LeaderboardRowProps {
  rank: number
  username: string
  avatarInitials: string
  totalPoints: number
  exactScores: number
  isCurrentUser?: boolean
}

const rankDisplay = (rank: number) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return String(rank)
}

export function LeaderboardRow({
  rank, username, avatarInitials, totalPoints, exactScores, isCurrentUser,
}: LeaderboardRowProps) {
  return (
    <div
      role="row"
      aria-label={`Rang ${rank} — ${username} — ${totalPoints} points`}
      className={clsx(
        'flex items-center gap-3 rounded-lg px-3.5 py-2.5',
        'transition-colors duration-base',
        isCurrentUser
          ? 'bg-[#0d2144] border border-pitch-400'
          : 'bg-pitch-800 hover:bg-pitch-700',
      )}
    >
      <span
        className="w-6 text-center text-lg leading-none"
        aria-hidden
      >
        {rankDisplay(rank)}
      </span>

      <div
        className="w-8 h-8 rounded-full bg-pitch-600 flex items-center justify-center
                   text-xs font-bold text-white shrink-0"
        aria-hidden
      >
        {avatarInitials}
      </div>

      <span className={clsx('flex-1 font-semibold text-sm', isCurrentUser && 'text-pitch-300')}>
        {username}
        {isCurrentUser && (
          <span className="ml-1.5 text-xs text-pitch-400 font-normal">(toi)</span>
        )}
      </span>

      <div className="text-right">
        <div className="font-bold text-gold-300 text-sm">{totalPoints} pts</div>
        <div className="text-xs text-text-muted">{exactScores} ⚽ exacts</div>
      </div>
    </div>
  )
}
