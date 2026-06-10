'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const tabs = [
  { href: '/',            label: 'Accueil',    icon: '🏠' },
  { href: '/matches',     label: 'Matchs',     icon: '📅' },
  { href: '/leaderboard', label: 'Classement', icon: '🏆' },
  { href: '/profile',     label: 'Profil',     icon: '👤' },
]

export function BottomBar() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 flex bg-[#041629] border-t border-[#334155] z-40"
      style={{ height: 'var(--bottombar-height, 64px)' }}
      aria-label="Navigation principale"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={clsx(
            'flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
            pathname === tab.href ? 'text-[#3b82f6]' : 'text-[#64748b] hover:text-[#94a3b8]',
          )}
          aria-current={pathname === tab.href ? 'page' : undefined}
        >
          <span className="text-xl leading-none" aria-hidden>{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
