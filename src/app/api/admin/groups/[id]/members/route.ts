import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id: groupId } = await params
  const { userId } = await req.json()
  const member = await prisma.groupMember.create({ data: { groupId, userId } })
  return NextResponse.json(member, { status: 201 })
}
