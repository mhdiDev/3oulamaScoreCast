'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Group { id: string; name: string }
interface Invitation {
  id: string
  token: string
  email: string | null
  expiresAt: Date | string
  usedAt: Date | string | null
  group: Group | null
  usedBy: { username: string } | null
}

export function InvitationsManager({
  invitations,
  groups,
  adminId,
}: {
  invitations: Invitation[]
  groups: Group[]
  adminId: string
}) {
  const [email, setEmail] = useState('')
  const [groupId, setGroupId] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, groupId: groupId || undefined }),
      })
      if (!res.ok) throw new Error('Erreur lors de la création')
      setEmail('')
      setGroupId('')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette invitation ?')) return
    await fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(`${baseUrl}/invite/${token}`)
  }

  const active = invitations.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date())
  const used = invitations.filter((i) => i.usedAt)
  const expired = invitations.filter((i) => !i.usedAt && new Date(i.expiresAt) <= new Date())

  return (
    <div className="space-y-5">
      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-[#0a2540] border border-[#334155] rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Nouvelle invitation</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email (optionnel)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-[#041629] border border-[#334155] rounded-xl px-3 py-2 text-sm
                       focus:outline-none focus:border-[#3b82f6]"
          />
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="bg-[#041629] border border-[#334155] rounded-xl px-3 py-2 text-sm
                       focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="">Aucun groupe</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="w-full bg-[#f59e0b] text-[#020d1a] font-bold py-2 rounded-xl hover:bg-[#fbbf24] disabled:opacity-50 transition-colors text-sm"
        >
          {creating ? 'Création…' : '+ Créer un lien d\'invitation'}
        </button>
      </form>

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[#64748b] mb-2">Actives ({active.length})</h2>
          <div className="space-y-2">
            {active.map((inv) => (
              <div key={inv.id} className="bg-[#0a2540] border border-[#334155] rounded-xl px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-mono text-[#93c5fd] truncate">
                      {baseUrl}/invite/{inv.token}
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5">
                      {inv.email && `${inv.email} · `}
                      {inv.group ? `Groupe: ${inv.group.name} · ` : ''}
                      Expire le {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => copyLink(inv.token)}
                      className="px-2 py-1 bg-[#0e3460] border border-[#334155] rounded-lg text-xs hover:border-[#3b82f6]"
                    >
                      Copier
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="px-2 py-1 bg-[#1c0606] border border-[#7f1d1d] rounded-lg text-xs text-red-400 hover:border-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used */}
      {used.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[#64748b] mb-2">Utilisées ({used.length})</h2>
          <div className="space-y-1">
            {used.map((inv) => (
              <div key={inv.id} className="bg-[#041629] border border-[#1e293b] rounded-xl px-4 py-2 text-xs text-[#64748b]">
                {inv.email ?? inv.token.slice(0, 8) + '…'} → {inv.usedBy?.username} ·{' '}
                {new Date(inv.usedAt!).toLocaleDateString('fr-FR')}
              </div>
            ))}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[#64748b] mb-2">Expirées ({expired.length})</h2>
          <div className="space-y-1">
            {expired.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-[#041629] border border-[#1e293b] rounded-xl px-4 py-2">
                <span className="text-xs text-[#64748b]">{inv.email ?? inv.token.slice(0, 8) + '…'}</span>
                <button
                  onClick={() => handleDelete(inv.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
