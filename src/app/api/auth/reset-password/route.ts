import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Lien expiré ou invalide' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, resetToken: null, resetTokenExpiresAt: null },
  })

  return NextResponse.json({ ok: true })
}
