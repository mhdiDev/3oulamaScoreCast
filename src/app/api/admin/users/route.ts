import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: {
      id: true, username: true, email: true, role: true,
      createdAt: true, avatarUrl: true,
      _count: { select: { predictions: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}
