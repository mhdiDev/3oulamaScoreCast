import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { group: true },
  })

  if (!invitation) return NextResponse.json({ error: 'Invitation invalide' }, { status: 404 })
  if (invitation.usedAt) return NextResponse.json({ error: 'Invitation déjà utilisée' }, { status: 410 })
  if (invitation.expiresAt < new Date()) return NextResponse.json({ error: 'Invitation expirée' }, { status: 410 })

  return NextResponse.json({
    valid: true,
    groupName: invitation.group?.name ?? null,
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json()
  const { username, email, password } = body

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Mot de passe trop court (8 caractères min)' }, { status: 400 })
  }

  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invitation invalide ou expirée' }, { status: 410 })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (existing) {
    return NextResponse.json({ error: 'Email ou pseudo déjà utilisé' }, { status: 409 })
  }

  const passwordHash = await hash(password, 12)

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email, username, passwordHash },
    })
    await tx.invitation.update({
      where: { token },
      data: { usedById: u.id, usedAt: new Date() },
    })
    if (invitation.groupId) {
      await tx.groupMember.create({
        data: { groupId: invitation.groupId, userId: u.id },
      })
    }
    // Initialise leaderboard snapshot global
    await tx.leaderboardSnapshot.create({
      data: { userId: u.id, groupId: null, rank: 0 },
    })
    return u
  })

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 })
}
