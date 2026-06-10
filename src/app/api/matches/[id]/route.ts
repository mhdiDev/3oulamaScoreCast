import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true },
  })
  if (!match) return NextResponse.json({ error: 'Match introuvable' }, { status: 404 })

  const myPrediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: session.user.id, matchId: id } },
  })

  // Pronostics des autres visibles seulement après la coupure
  let groupPredictions = null
  if (new Date() > match.cutoffAt) {
    const userGroups = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      select: { groupId: true },
    })
    const groupIds = userGroups.map((g) => g.groupId)

    if (groupIds.length > 0) {
      const members = await prisma.groupMember.findMany({
        where: { groupId: { in: groupIds } },
        select: { userId: true },
        distinct: ['userId'],
      })
      const memberIds = members.map((m) => m.userId)
      groupPredictions = await prisma.prediction.findMany({
        where: { matchId: id, userId: { in: memberIds } },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      })
    }
  }

  return NextResponse.json({ match, myPrediction, groupPredictions })
}
