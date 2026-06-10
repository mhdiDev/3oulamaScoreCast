import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { UsersManager } from '@/components/admin/UsersManager'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const users = await prisma.user.findMany({
    select: {
      id: true, username: true, email: true, role: true, createdAt: true,
      _count: { select: { predictions: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Utilisateurs</h1>
      <UsersManager users={users} currentUserId={session.user.id} />
    </div>
  )
}
