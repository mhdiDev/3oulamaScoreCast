'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/',           label: 'Accueil',     icon: '🏠' },
  { href: '/matches',    label: 'Matchs',      icon: '📅' },
  { href: '/leaderboard',label: 'Classement',  icon: '🏆' },
  { href: '/profile',    label: 'Profil',      icon: '👤' },
]

const adminItems = [
  { href: '/admin',              label: 'Dashboard', icon: '📊' },
  { href: '/admin/invitations',  label: 'Invitations', icon: '🔗' },
  { href: '/admin/groups',       label: 'Groupes',   icon: '👥' },
  { href: '/admin/users',        label: 'Utilisateurs', icon: '🧑‍🤝‍🧑' },
  { href: '/admin/scoring',      label: 'Barème',    icon: '⚙️' },
]

interface SidebarProps { isAdmin?: boolean }

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-[240px]
                 bg-[#041629] border-r border-[#334155] z-40"
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#334155]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#154d8f] to-[#3b82f6]
                        flex items-center justify-center text-xl">⚽</div>
        <div>
          <div className="font-bold text-sm leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>ScoreCast</div>
          <div className="text-xs text-[#64748b]">CM 2026</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menu">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-[#0e3460] text-white'
                : 'text-[#94a3b8] hover:bg-[#0a2540] hover:text-white',
            )}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-widest text-[#475569]">
              Admin
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(item.href) && item.href !== '/admin'
                    ? 'bg-[#0e3460] text-white'
                    : pathname === item.href && item.href === '/admin'
                    ? 'bg-[#0e3460] text-white'
                    : 'text-[#94a3b8] hover:bg-[#0a2540] hover:text-white',
                )}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-4 border-t border-[#334155]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-[#94a3b8] hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <span aria-hidden>🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
