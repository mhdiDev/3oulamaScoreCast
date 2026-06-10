import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/ui/ProfileForm'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) return null

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      id: true, username: true, email: true, avatarUrl: true,
      locale: true, emailNotifications: true, createdAt: true,
    },
  })

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Mon profil</h1>
      <ProfileForm user={user} />
    </div>
  )
}
