import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  const invitations = await prisma.invitation.findMany({
    include: {
      group:   { select: { name: true } },
      usedBy:  { select: { username: true } },
    },
    orderBy: { expiresAt: 'desc' },
  })
  return NextResponse.json(invitations)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await req.json()
  const groupId = body.groupId ?? null

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 72)

  const invitation = await prisma.invitation.create({
    data: {
      createdById: session.user.id,
      groupId,
      expiresAt,
    },
  })

  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invitation.token}`
  return NextResponse.json({ ...invitation, url: inviteUrl }, { status: 201 })
}
