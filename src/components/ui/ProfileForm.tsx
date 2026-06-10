'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileUser {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  locale: string
  emailNotifications: boolean
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const [username, setUsername] = useState(user.username)
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, emailNotifications }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur')
      }
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-20 h-20 rounded-full bg-[#154d8f] flex items-center justify-center text-2xl font-extrabold"
          aria-hidden
        >
          {username.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-xs text-[#64748b]">Avatar auto-généré</span>
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
          Nom d'utilisateur
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={2}
          maxLength={32}
          required
          className="w-full bg-[#0a2540] border border-[#334155] rounded-xl px-4 py-3 text-white
                     focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]
                     transition-colors"
        />
      </div>

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Email</label>
        <div className="w-full bg-[#041629] border border-[#1e293b] rounded-xl px-4 py-3 text-[#64748b]">
          {user.email}
        </div>
      </div>

      {/* Email notifications toggle */}
      <div className="flex items-center justify-between bg-[#0a2540] border border-[#334155] rounded-xl px-4 py-3">
        <div>
          <div className="text-sm font-medium">Notifications email</div>
          <div className="text-xs text-[#64748b]">Rappels avant les matchs</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={emailNotifications}
          onClick={() => setEmailNotifications(!emailNotifications)}
          className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-[#3b82f6] ${
            emailNotifications ? 'bg-[#3b82f6]' : 'bg-[#334155]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              emailNotifications ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
          <span className="sr-only">{emailNotifications ? 'Désactiver' : 'Activer'} les notifications email</span>
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#f59e0b] text-[#020d1a] font-bold py-3 rounded-xl
                   hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors focus-visible:outline-2 focus-visible:outline-[#3b82f6]"
      >
        {saving ? 'Enregistrement…' : saved ? '✓ Enregistré !' : 'Sauvegarder'}
      </button>
    </form>
  )
}
