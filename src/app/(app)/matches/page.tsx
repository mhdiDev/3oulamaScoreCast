import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Phase de groupes',
  R32:   'Tour préliminaire',
  R16:   '8e de finale',
  QF:    'Quart de finale',
  SF:    'Demi-finale',
  FINAL: 'Finale',
}

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ stage?: string; group?: string }> }) {
  const session = await auth()
  if (!session) return null

  const sp = await searchParams
  const stageFilter = sp.stage
  const groupFilter = sp.group

  const matches = await prisma.match.findMany({
    where: {
      ...(stageFilter ? { stage: stageFilter as any } : {}),
      ...(groupFilter ? { group: groupFilter } : {}),
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: 'asc' },
  })

  const myPredictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
  })
  const predByMatch = Object.fromEntries(myPredictions.map((p) => [p.matchId, p]))

  // Group by date
  const byDate: Record<string, typeof matches> = {}
  for (const m of matches) {
    const key = new Date(m.kickoffAt).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(m)
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
        Calendrier des matchs
      </h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['GROUP', 'R16', 'QF', 'SF', 'FINAL'].map((s) => (
          <Link
            key={s}
            href={`/matches?stage=${s}`}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              stageFilter === s
                ? 'bg-[#154d8f] text-white border-[#1a65c0]'
                : 'border-[#334155] text-[#94a3b8] hover:border-[#1a65c0]'
            }`}
          >
            {STAGE_LABELS[s]}
          </Link>
        ))}
        {stageFilter && (
          <Link href="/matches" className="px-3 py-1 rounded-full text-xs text-[#64748b] border border-[#334155] hover:border-[#334155]">
            ✕ Effacer
          </Link>
        )}
      </div>

      {/* Match list */}
      {Object.entries(byDate).map(([date, dayMatches]) => (
        <div key={date} className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[#64748b] mb-2">{date}</div>
          <div className="space-y-2">
            {dayMatches.map((match) => {
              const pred = predByMatch[match.id]
              const isPast = new Date() >= match.cutoffAt
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex items-center bg-[#0a2540] border border-[#334155] rounded-xl p-3
                             hover:border-[#154d8f] transition-colors gap-3"
                >
                  <div className="flex-1 flex items-center justify-between gap-2 text-sm font-semibold min-w-0">
                    <span className="truncate">{match.homeTeam.name}</span>
                    <div className="flex flex-col items-center shrink-0">
                      {match.status === 'LIVE' && (
                        <span className="text-[10px] font-bold text-red-400 animate-pulse mb-0.5">● LIVE</span>
                      )}
                      {match.status === 'FINISHED' ? (
                        <span className="font-extrabold text-[#fbbf24]">
                          {match.homeScore} — {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">
                          {new Date(match.kickoffAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-right">{match.awayTeam.name}</span>
                  </div>
                  <div className="shrink-0">
                    {pred ? (
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        pred.points === 3 ? 'bg-[#451a03] text-[#fde68a]' :
                        pred.points !== null && pred.points > 0 ? 'bg-[#052e16] text-[#86efac]' :
                        pred.points === 0 ? 'bg-[#1e293b] text-[#64748b]' :
                        'bg-[#1c3451] text-[#93c5fd]'
                      }`}>
                        {pred.homeScore}–{pred.awayScore}
                      </span>
                    ) : !isPast ? (
                      <span className="text-xs bg-[#f59e0b] text-[#020d1a] font-bold px-2 py-1 rounded-full">
                        Pronostiquer
                      </span>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
