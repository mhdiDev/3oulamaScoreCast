import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TeamFlag } from '@/components/ui/TeamFlag'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const userId = session.user.id

  // Rang global
  const snapshot = await prisma.leaderboardSnapshot.findFirst({
    where: { userId, groupId: null },
  })

  // Prochains matchs (5 max)
  const upcomingMatches = await prisma.match.findMany({
    where: { status: { in: ['SCHEDULED', 'LIVE'] } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: 'asc' },
    take: 5,
  })

  // Mes pronostics sur ces matchs
  const myPredictions = await prisma.prediction.findMany({
    where: {
      userId,
      matchId: { in: upcomingMatches.map((m) => m.id) },
    },
  })
  const predByMatch = Object.fromEntries(myPredictions.map((p) => [p.matchId, p]))

  // Stats
  const allPreds = await prisma.prediction.findMany({ where: { userId, points: { not: null } } })
  const totalPreds = await prisma.prediction.count({ where: { userId } })
  const exactScores = allPreds.filter((p) => p.points === 3).length

  return (
    <div>
      {/* Hero rang */}
      <div className="rounded-xl p-5 mb-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #0e3460, #154d8f)' }}>
        <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Ton rang</div>
        <div className="text-3xl font-extrabold mb-0.5">
          {snapshot?.rank ? `#${snapshot.rank}` : '—'}
        </div>
        <div className="text-[#fbbf24] font-bold text-lg">
          {snapshot?.totalPoints ?? 0} points
        </div>
        <div className="text-sm text-white/50 mt-1">
          {exactScores} scores exacts · Série 🔥×{snapshot?.currentStreak ?? 0}
        </div>
        <div className="absolute right-0 top-0 text-6xl opacity-5 select-none" aria-hidden>🏆</div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#0a2540] border border-[#334155] rounded-lg p-3 text-center">
          <div className="text-xl font-extrabold text-[#fbbf24]">{exactScores}</div>
          <div className="text-xs text-[#94a3b8] mt-0.5">Exacts ⚽</div>
        </div>
        <div className="bg-[#0a2540] border border-[#334155] rounded-lg p-3 text-center">
          <div className="text-xl font-extrabold text-[#22c55e]">{snapshot?.correctResults ?? 0}</div>
          <div className="text-xs text-[#94a3b8] mt-0.5">Bons résultats</div>
        </div>
        <div className="bg-[#0a2540] border border-[#334155] rounded-lg p-3 text-center">
          <div className="text-xl font-extrabold text-[#3b82f6]">{totalPreds}</div>
          <div className="text-xs text-[#94a3b8] mt-0.5">Pronostics</div>
        </div>
      </div>

      {/* Prochains matchs */}
      <h2 className="text-xs uppercase tracking-widest text-[#64748b] mb-3">Prochains matchs</h2>
      <div className="space-y-2">
        {upcomingMatches.map((match) => {
          const pred = predByMatch[match.id]
          const isPast = new Date() >= match.cutoffAt
          return (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="block bg-[#0a2540] border border-[#334155] rounded-xl p-3
                         hover:border-[#154d8f] hover:bg-[#0e3460] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#64748b]">
                  {match.group ? `Groupe ${match.group} · ` : ''}{match.city}
                </span>
                {match.status === 'LIVE' ? (
                  <span className="text-[10px] font-bold text-red-400 animate-pulse">● LIVE</span>
                ) : (
                  <span className="text-[10px] text-[#94a3b8]">
                    {new Date(match.kickoffAt).toLocaleString('fr-FR', {
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
                  <TeamFlag name={match.homeTeam.name} flagUrl={match.homeTeam.flagUrl} size="sm" />
                  <span className="truncate">{match.homeTeam.name}</span>
                </div>
                <div className="shrink-0">
                  {pred ? (
                    <div className="bg-[#041629] rounded-lg px-3 py-1 text-sm font-bold text-[#93c5fd] whitespace-nowrap">
                      {pred.homeScore} — {pred.awayScore}
                      {pred.points !== null && (
                        <span className="ml-1 text-xs text-[#fbbf24]">+{pred.points}pts</span>
                      )}
                    </div>
                  ) : isPast ? (
                    <span className="text-xs text-[#64748b]">Coupure</span>
                  ) : (
                    <span className="bg-[#f59e0b] text-[#020d1a] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Pronostiquer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold min-w-0 justify-end">
                  <span className="truncate text-right">{match.awayTeam.name}</span>
                  <TeamFlag name={match.awayTeam.name} flagUrl={match.awayTeam.flagUrl} size="sm" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <Link
        href="/matches"
        className="block text-center text-sm text-[#3b82f6] hover:text-[#93c5fd] mt-4 transition-colors"
      >
        Voir tous les matchs →
      </Link>
    </div>
  )
}
