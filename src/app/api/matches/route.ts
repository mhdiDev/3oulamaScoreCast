import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const stage  = searchParams.get('stage') ?? undefined
  const group  = searchParams.get('group') ?? undefined
  const status = searchParams.get('status') ?? undefined

  const matches = await prisma.match.findMany({
    where: {
      ...(stage  ? { stage:  stage  as any } : {}),
      ...(group  ? { group }                 : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { kickoffAt: 'asc' },
  })

  return NextResponse.json(matches)
}
