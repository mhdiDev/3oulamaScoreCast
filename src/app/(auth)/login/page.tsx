'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email, password, redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Email ou mot de passe incorrect')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020d1a] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">⚽</div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
            ScoreCast
          </h1>
          <p className="text-[#64748b] text-sm mt-1">Pronostics Coupe du Monde 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a2540] border border-[#334155] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-center mb-2">Connexion</h2>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#041629] border border-[#334155] rounded-xl px-4 py-3 text-white
                         focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[#041629] border border-[#334155] rounded-xl px-4 py-3 text-white
                         focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f59e0b] text-[#020d1a] font-bold py-3 rounded-xl
                       hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors focus-visible:outline-2 focus-visible:outline-[#3b82f6]"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <p className="text-center text-sm text-[#64748b]">
            <Link href="/forgot-password" className="text-[#3b82f6] hover:underline">
              Mot de passe oublié ?
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
