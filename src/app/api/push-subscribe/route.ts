import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const subscription = await req.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushSubscription: subscription },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushSubscription: Prisma.JsonNull },
  })

  return NextResponse.json({ ok: true })
}
