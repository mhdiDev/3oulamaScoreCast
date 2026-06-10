'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 8) { setError('Minimum 8 caractères'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur')
      }
      router.push('/login?reset=1')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <p className="text-center text-red-400 text-sm">
        Lien invalide.{' '}
        <Link href="/forgot-password" className="text-[#3b82f6] hover:underline">Recommencer</Link>
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-[#041629] border border-[#334155] rounded-xl px-4 py-3 text-white
                     focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
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
        {loading ? 'Enregistrement…' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020d1a] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">⚽</div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>ScoreCast</h1>
        </div>
        <div className="bg-[#0a2540] border border-[#334155] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-center mb-4">Nouveau mot de passe</h2>
          <Suspense fallback={<p className="text-center text-[#64748b] text-sm">Chargement…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
