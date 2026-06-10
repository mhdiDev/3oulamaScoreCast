import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  const { name } = await req.json()
  const group = await prisma.group.update({ where: { id }, data: { name } })
  return NextResponse.json(group)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  await prisma.group.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
