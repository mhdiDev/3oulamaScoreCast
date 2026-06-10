import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { GroupsManager } from '@/components/admin/GroupsManager'

export default async function AdminGroupsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [groups, users] = await Promise.all([
    prisma.group.findMany({
      include: {
        members: { include: { user: { select: { id: true, username: true } } } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({ select: { id: true, username: true }, orderBy: { username: 'asc' } }),
  ])

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Groupes</h1>
      <GroupsManager groups={groups} users={users} />
    </div>
  )
}
