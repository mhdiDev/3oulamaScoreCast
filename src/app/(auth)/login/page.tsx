'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    await signIn('google', { callbackUrl: '/' })
  }

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

        <div className="bg-[#0a2540] border border-[#334155] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-center mb-2">Connexion</h2>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] font-semibold
                       py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {googleLoading ? (
              <span className="text-sm">Redirection…</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                <span className="text-sm">Continuer avec Google</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#334155]" />
            <span className="text-xs text-[#64748b]">ou</span>
            <div className="flex-1 h-px bg-[#334155]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={loading || googleLoading}
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
    </div>
  )
}
