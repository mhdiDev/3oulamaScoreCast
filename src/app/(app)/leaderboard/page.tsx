import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const session = await auth()
  if (!session) return null

  const sp = await searchParams
  const groupId = sp.groupId ?? null

  const myGroups = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: { group: true },
  })

  // Validate group access
  if (groupId && !myGroups.some((g) => g.groupId === groupId)) {
    return <p className="text-red-400">Accès refusé à ce groupe.</p>
  }

  const snapshots = await prisma.leaderboardSnapshot.findMany({
    where: { groupId: groupId ?? null },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    orderBy: { rank: 'asc' },
  })

  const rankEmoji = (r: number) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `${r}`

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Classement</h1>

      {/* Group tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        <Link
          href="/leaderboard"
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !groupId ? 'bg-[#154d8f] text-white border-[#1a65c0]' : 'border-[#334155] text-[#94a3b8] hover:border-[#1a65c0]'
          }`}
        >
          🌍 Général
        </Link>
        {myGroups.map((gm) => (
          <Link
            key={gm.groupId}
            href={`/leaderboard?groupId=${gm.groupId}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              groupId === gm.groupId ? 'bg-[#154d8f] text-white border-[#1a65c0]' : 'border-[#334155] text-[#94a3b8] hover:border-[#1a65c0]'
            }`}
          >
            👥 {gm.group.name}
          </Link>
        ))}
      </div>

      {/* Ranking */}
      <div
        role="list"
        aria-label="Classement des joueurs"
      >
        {snapshots.length === 0 && (
          <p className="text-[#64748b] text-sm text-center py-8">Aucun pronostic calculé pour l'instant.</p>
        )}
        {snapshots.map((snap) => {
          const isMe = snap.userId === session.user.id
          return (
            <div
              key={snap.userId}
              role="listitem"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-2 transition-colors ${
                isMe
                  ? 'bg-[#0d2144] border border-[#3b82f6]'
                  : 'bg-[#0a2540] border border-[#334155] hover:bg-[#0e3460]'
              }`}
            >
              <span className="w-7 text-center text-lg leading-none" aria-hidden>
                {rankEmoji(snap.rank)}
              </span>
              <div
                className="w-9 h-9 rounded-full bg-[#154d8f] flex items-center justify-center text-xs font-bold shrink-0"
                aria-hidden
              >
                {snap.user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm truncate ${isMe ? 'text-[#93c5fd]' : ''}`}>
                  {snap.user.username}
                  {isMe && <span className="ml-1 text-xs text-[#3b82f6] font-normal">(toi)</span>}
                </div>
                <div className="text-xs text-[#64748b]">
                  {snap.exactScores} ⚽ · {snap.correctResults} ✓ · 🔥×{snap.currentStreak}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[#fbbf24]">{snap.totalPoints} pts</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
