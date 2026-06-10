import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchLiveAndFinishedMatches, mapApiStatus } from '@/lib/football-api'
import { calculatePoints } from '@/lib/scoring'
import { recomputeLeaderboard } from '@/lib/leaderboard'

export async function POST() {
  const apiMatches = await fetchLiveAndFinishedMatches()
  const rule = await prisma.scoringRule.findUniqueOrThrow({ where: { id: 1 } })

  let updated = 0
  let scored = 0

  for (const apiMatch of apiMatches) {
    const dbMatch = await prisma.match.findUnique({
      where: { externalId: String(apiMatch.id) },
    })
    if (!dbMatch) continue

    const newStatus    = mapApiStatus(apiMatch.status)
    const homeScore    = apiMatch.score.fullTime.home
    const awayScore    = apiMatch.score.fullTime.away

    await prisma.match.update({
      where: { id: dbMatch.id },
      data: {
        status:    newStatus,
        homeScore: homeScore ?? dbMatch.homeScore,
        awayScore: awayScore ?? dbMatch.awayScore,
      },
    })
    updated++

    // Calculate points for FINISHED matches with complete scores
    if (
      newStatus === 'FINISHED' &&
      homeScore !== null &&
      awayScore !== null
    ) {
      const predictions = await prisma.prediction.findMany({
        where: { matchId: dbMatch.id, points: null },
      })

      for (const pred of predictions) {
        const points = calculatePoints(
          { homeScore: pred.homeScore, awayScore: pred.awayScore },
          { homeScore, awayScore },
          rule,
        )
        await prisma.prediction.update({
          where: { id: pred.id },
          data:  { points },
        })
        scored++
      }
    }
  }

  if (scored > 0) {
    await recomputeLeaderboard()
  }

  return NextResponse.json({ updated, scored })
}
