import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculatePoints } from '@/lib/scoring'
import { recomputeLeaderboard } from '@/lib/leaderboard'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  const { homeScore, awayScore } = await req.json()

  if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
    return NextResponse.json({ error: 'Scores invalides' }, { status: 400 })
  }

  const match = await prisma.match.update({
    where: { id },
    data:  { homeScore, awayScore, status: 'FINISHED' },
  })

  // Recalculate all predictions for this match
  const rule = await prisma.scoringRule.findUniqueOrThrow({ where: { id: 1 } })
  const predictions = await prisma.prediction.findMany({ where: { matchId: id } })

  for (const pred of predictions) {
    const points = calculatePoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { homeScore, awayScore },
      rule,
    )
    await prisma.prediction.update({ where: { id: pred.id }, data: { points } })
  }

  await recomputeLeaderboard()
  return NextResponse.json(match)
}
