import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { matchId } = await params
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) return NextResponse.json({ error: 'Match introuvable' }, { status: 404 })

  if (new Date() >= match.cutoffAt) {
    return NextResponse.json({ error: 'Coupure dépassée — pronostic non modifiable' }, { status: 403 })
  }

  const body = await req.json()
  const homeScore = parseInt(body.homeScore)
  const awayScore = parseInt(body.awayScore)

  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return NextResponse.json({ error: 'Scores invalides' }, { status: 400 })
  }

  const prediction = await prisma.prediction.upsert({
    where:  { userId_matchId: { userId: session.user.id, matchId } },
    create: { userId: session.user.id, matchId, homeScore, awayScore },
    update: { homeScore, awayScore },
  })

  return NextResponse.json(prediction)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { matchId } = await params
  const prediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: session.user.id, matchId } },
  })
  return NextResponse.json(prediction)
}
