import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InvitationsManager } from '@/components/admin/InvitationsManager'

export default async function AdminInvitationsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [invitations, groups] = await Promise.all([
    prisma.invitation.findMany({
      include: {
        group: { select: { id: true, name: true } },
        usedBy: { select: { username: true } },
      },
      orderBy: { expiresAt: 'desc' },
    }),
    prisma.group.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Invitations</h1>
      <InvitationsManager invitations={invitations} groups={groups} adminId={session.user.id} />
    </div>
  )
}
