import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ScoringForm } from '@/components/admin/ScoringForm'

export default async function AdminScoringPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const rule = await prisma.scoringRule.findUnique({ where: { id: 1 } })

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Barème de points</h1>
      <ScoringForm rule={rule ?? { exactScore: 3, closeResult: 2, correctResult: 1, wrongPrediction: 0 }} />
    </div>
  )
}
