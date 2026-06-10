import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { username, emailNotifications } = body

  if (username !== undefined && (typeof username !== 'string' || username.length < 2 || username.length > 32)) {
    return NextResponse.json({ error: 'Nom d\'utilisateur invalide (2-32 caractères)' }, { status: 400 })
  }

  const existing = username ? await prisma.user.findFirst({
    where: { username, NOT: { id: session.user.id } },
  }) : null

  if (existing) {
    return NextResponse.json({ error: 'Ce nom d\'utilisateur est déjà pris' }, { status: 409 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(username !== undefined && { username }),
      ...(emailNotifications !== undefined && { emailNotifications: Boolean(emailNotifications) }),
    },
    select: { id: true, username: true, emailNotifications: true },
  })

  return NextResponse.json(user)
}
