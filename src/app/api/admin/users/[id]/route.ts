import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const user = await prisma.user.update({ where: { id }, data: body })
  return NextResponse.json({ id: user.id, role: user.role })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  if (id === session.user.id) return NextResponse.json({ error: 'Impossible de supprimer son propre compte' }, { status: 400 })
  await prisma.user.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
