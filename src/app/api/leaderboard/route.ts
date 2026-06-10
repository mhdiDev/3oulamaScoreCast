import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const groupId = new URL(req.url).searchParams.get('groupId')

  // Si groupId fourni, vérifier que le user est membre
  if (groupId) {
    const isMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    })
    if (!isMember) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
  }

  const snapshots = await prisma.leaderboardSnapshot.findMany({
    where: { groupId: groupId ?? null },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: { rank: 'asc' },
  })

  return NextResponse.json(snapshots)
}
