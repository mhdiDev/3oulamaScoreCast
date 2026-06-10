import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const rule = await prisma.scoringRule.findUniqueOrThrow({ where: { id: 1 } })
  return NextResponse.json(rule)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await req.json()
  const { exactScore, closeResult, correctResult, wrongPrediction } = body

  if (
    typeof exactScore !== 'number' ||
    typeof closeResult !== 'number' ||
    typeof correctResult !== 'number' ||
    typeof wrongPrediction !== 'number'
  ) {
    return NextResponse.json({ error: 'Valeurs invalides' }, { status: 400 })
  }

  const rule = await prisma.scoringRule.update({
    where: { id: 1 },
    data:  { exactScore, closeResult, correctResult, wrongPrediction, updatedById: session.user.id },
  })
  return NextResponse.json(rule)
}
