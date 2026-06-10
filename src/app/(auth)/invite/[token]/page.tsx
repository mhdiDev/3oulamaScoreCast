'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

interface InviteInfo {
  email: string
  groupName?: string
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/auth/invite/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setInvite)
      .catch(() => setNotFound(true))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Minimum 8 caractères'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/auth/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        // email is read from the invitation server-side
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur')
      }
      // Auto-login after registration
      await signIn('credentials', { email: invite!.email, password, redirect: false })
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020d1a] px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2">Invitation invalide</h1>
          <p className="text-[#64748b] text-sm mb-4">Ce lien a expiré ou n'existe pas.</p>
          <Link href="/login" className="text-[#3b82f6] hover:underline text-sm">Connexion</Link>
        </div>
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020d1a]">
        <p className="text-[#64748b]">Vérification de l'invitation…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020d1a] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">⚽</div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>ScoreCast</h1>
          {invite.groupName && (
            <p className="text-[#64748b] text-sm mt-1">Rejoindre · {invite.groupName}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a2540] border border-[#334155] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-center">Créer votre compte</h2>

          <div className="bg-[#041629] border border-[#1e293b] rounded-xl px-4 py-2 text-sm text-[#64748b]">
            📧 {invite.email}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={32}
              autoComplete="username"
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
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-[#041629] border border-[#334155] rounded-xl px-4 py-3 text-white
                         focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
            />
            <p className="text-xs text-[#64748b] mt-1">Minimum 8 caractères</p>
          </div>

          {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f59e0b] text-[#020d1a] font-bold py-3 rounded-xl
                       hover:bg-[#fbbf24] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}
