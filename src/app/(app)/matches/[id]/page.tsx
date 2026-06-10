import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PredictionForm } from '@/components/predictions/PredictionForm'
import { TeamFlag } from '@/components/ui/TeamFlag'

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return null

  const { id } = await params
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true },
  })
  if (!match) notFound()

  const myPrediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: session.user.id, matchId: id } },
  })

  // Pronostics du groupe si après coupure
  let groupPredictions: Array<{
    homeScore: number; awayScore: number; points: number | null;
    user: { username: string; avatarUrl: string | null };
  }> = []

  if (new Date() > match.cutoffAt) {
    const myGroups = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      select: { groupId: true },
    })
    if (myGroups.length > 0) {
      const memberIds = (await prisma.groupMember.findMany({
        where: { groupId: { in: myGroups.map((g) => g.groupId) } },
        select: { userId: true },
        distinct: ['userId'],
      })).map((m) => m.userId)

      groupPredictions = await prisma.prediction.findMany({
        where: { matchId: id, userId: { in: memberIds } },
        include: { user: { select: { username: true, avatarUrl: true } } },
      })
    }
  }

  const STAGE_LABELS: Record<string, string> = {
    GROUP: 'Groupe', R32: 'T. préliminaire', R16: '8e de finale',
    QF: 'Quart de finale', SF: 'Demi-finale', FINAL: 'Finale',
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Match header */}
      <div className="text-center mb-6">
        <div className="text-xs text-[#64748b] mb-2">
          {STAGE_LABELS[match.stage]}{match.group ? ` · Groupe ${match.group}` : ''} · {match.city}
        </div>
        <div className="text-xs text-[#94a3b8] mb-4">
          {new Date(match.kickoffAt).toLocaleString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
          })}
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="text-center flex flex-col items-center gap-2 w-28">
            <TeamFlag name={match.homeTeam.name} flagUrl={match.homeTeam.flagUrl} size="lg" />
            <div className="font-bold text-sm leading-tight">{match.homeTeam.name}</div>
          </div>

          <div className="flex flex-col items-center gap-1 px-2">
            {match.status === 'FINISHED' ? (
              <>
                <div className="text-3xl font-extrabold text-[#fbbf24] tabular-nums">
                  {match.homeScore} — {match.awayScore}
                </div>
                <div className="text-xs text-[#22c55e]">Terminé</div>
              </>
            ) : match.status === 'LIVE' ? (
              <>
                <div className="text-3xl font-extrabold text-[#fbbf24] tabular-nums">
                  {match.homeScore ?? 0} — {match.awayScore ?? 0}
                </div>
                <div className="text-xs text-red-400 animate-pulse">● LIVE</div>
              </>
            ) : (
              <div className="text-[#64748b] font-light text-2xl">vs</div>
            )}
          </div>

          <div className="text-center flex flex-col items-center gap-2 w-28">
            <TeamFlag name={match.awayTeam.name} flagUrl={match.awayTeam.flagUrl} size="lg" />
            <div className="font-bold text-sm leading-tight">{match.awayTeam.name}</div>
          </div>
        </div>
      </div>

      {/* Prediction form */}
      {match.status !== 'FINISHED' && (
        <PredictionForm
          matchId={match.id}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          cutoffAt={match.cutoffAt}
          initialHome={myPrediction?.homeScore ?? 1}
          initialAway={myPrediction?.awayScore ?? 1}
        />
      )}

      {/* Finished + my result */}
      {match.status === 'FINISHED' && myPrediction && (
        <div className={`rounded-xl p-4 text-center mb-4 ${
          myPrediction.points === 3 ? 'bg-[#451a03] border border-[#d97706]' :
          myPrediction.points === 1 ? 'bg-[#052e16] border border-[#16a34a]' :
          'bg-[#0a2540] border border-[#334155]'
        }`}>
          <div className="text-sm text-[#94a3b8]">Ton pronostic</div>
          <div className="text-2xl font-extrabold tabular-nums my-1">
            {myPrediction.homeScore} — {myPrediction.awayScore}
          </div>
          <div className={`text-lg font-bold ${
            myPrediction.points === 3 ? 'text-[#fde68a]' :
            myPrediction.points === 1 ? 'text-[#86efac]' : 'text-[#64748b]'
          }`}>
            {myPrediction.points === 3 && '🏆 Score exact ! +3 pts'}
            {myPrediction.points === 1 && '✓ Bon résultat +1 pt'}
            {myPrediction.points === 0 && '✗ Mauvais pronostic'}
            {myPrediction.points === null && 'Calcul en cours…'}
          </div>
        </div>
      )}

      {/* Group predictions */}
      {groupPredictions.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs uppercase tracking-widest text-[#64748b] mb-3">
            Pronostics du groupe
          </h2>
          <div className="space-y-2">
            {groupPredictions.map((pred, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#0a2540] border border-[#334155] rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-[#154d8f] flex items-center justify-center text-xs font-bold">
                  {pred.user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="flex-1 text-sm">{pred.user.username}</span>
                <span className="font-bold tabular-nums text-sm">
                  {pred.homeScore} — {pred.awayScore}
                </span>
                {pred.points !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    pred.points === 3 ? 'bg-[#451a03] text-[#fde68a]' :
                    pred.points > 0 ? 'bg-[#052e16] text-[#86efac]' :
                    'bg-[#1e293b] text-[#64748b]'
                  }`}>
                    +{pred.points}pts
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
