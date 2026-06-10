'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur')
      }
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020d1a] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">⚽</div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>ScoreCast</h1>
        </div>

        <div className="bg-[#0a2540] border border-[#334155] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-center mb-2">Mot de passe oublié</h2>

          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">📧</div>
              <p className="text-sm text-[#94a3b8]">
                Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.
              </p>
              <Link href="/login" className="block text-[#3b82f6] hover:underline text-sm">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-[#64748b] text-center">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8] mb-1.5">Email</label>
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

              {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f59e0b] text-[#020d1a] font-bold py-3 rounded-xl
                           hover:bg-[#fbbf24] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>

              <p className="text-center text-sm">
                <Link href="/login" className="text-[#3b82f6] hover:underline">Retour à la connexion</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
