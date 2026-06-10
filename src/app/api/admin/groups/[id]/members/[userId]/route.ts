import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id: groupId, userId } = await params
  await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId } } })
  return new NextResponse(null, { status: 204 })
}
