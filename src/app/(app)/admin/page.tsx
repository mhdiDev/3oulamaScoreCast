import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [userCount, groupCount, pendingInvitations, matchCount] = await Promise.all([
    prisma.user.count(),
    prisma.group.count(),
    prisma.invitation.count({ where: { usedAt: null, expiresAt: { gt: new Date() } } }),
    prisma.match.count(),
  ])

  const stats = [
    { label: 'Utilisateurs', value: userCount, icon: '👥', href: '/admin/users' },
    { label: 'Groupes', value: groupCount, icon: '🏟', href: '/admin/groups' },
    { label: 'Invitations actives', value: pendingInvitations, icon: '✉️', href: '/admin/invitations' },
    { label: 'Matchs programmés', value: matchCount, icon: '⚽', href: '/admin/scoring' },
  ]

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
        Administration
      </h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-[#0a2540] border border-[#334155] rounded-xl p-4 hover:border-[#1a65c0] transition-colors"
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs text-[#64748b]">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {[
          { href: '/admin/invitations', label: 'Gérer les invitations', desc: 'Créer et révoquer des liens d\'invitation' },
          { href: '/admin/groups', label: 'Gérer les groupes', desc: 'Créer des groupes et ajouter des membres' },
          { href: '/admin/users', label: 'Gérer les utilisateurs', desc: 'Modifier les rôles et supprimer des comptes' },
          { href: '/admin/scoring', label: 'Barème de points', desc: 'Configurer les points pour chaque type de pronostic' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 bg-[#0a2540] border border-[#334155] rounded-xl px-4 py-3 hover:border-[#1a65c0] transition-colors"
          >
            <div className="flex-1">
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-[#64748b]">{item.desc}</div>
            </div>
            <span className="text-[#64748b]">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
