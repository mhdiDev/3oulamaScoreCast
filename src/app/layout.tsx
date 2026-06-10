import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ScoreCast — Coupe du Monde 2026',
  description: 'Pronostics entre amis pour la Coupe du Monde 2026',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full bg-pitch-950 text-slate-100 antialiased">
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  )
}
