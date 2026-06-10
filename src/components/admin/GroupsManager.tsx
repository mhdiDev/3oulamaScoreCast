'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User { id: string; username: string }
interface Group {
  id: string
  name: string
  members: { user: User }[]
}

export function GroupsManager({ groups, users }: { groups: Group[]; users: User[] }) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Erreur création')
      setName('')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce groupe ?')) return
    await fetch(`/api/admin/groups/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function handleAddMember(groupId: string, userId: string) {
    await fetch(`/api/admin/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.refresh()
  }

  async function handleRemoveMember(groupId: string, userId: string) {
    await fetch(`/api/admin/groups/${groupId}/members/${userId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Create */}
      <form onSubmit={handleCreate} className="bg-[#0a2540] border border-[#334155] rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Nouveau groupe</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nom du groupe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 bg-[#041629] border border-[#334155] rounded-xl px-3 py-2 text-sm
                       focus:outline-none focus:border-[#3b82f6]"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-[#f59e0b] text-[#020d1a] font-bold px-4 py-2 rounded-xl hover:bg-[#fbbf24] disabled:opacity-50 text-sm"
          >
            {creating ? '…' : 'Créer'}
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {/* Groups list */}
      {groups.map((group) => {
        const memberIds = new Set(group.members.map((m) => m.user.id))
        const nonMembers = users.filter((u) => !memberIds.has(u.id))

        return (
          <div key={group.id} className="bg-[#0a2540] border border-[#334155] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{group.name}</h3>
              <button
                onClick={() => handleDelete(group.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Supprimer
              </button>
            </div>

            {/* Members */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {group.members.map((m) => (
                <span
                  key={m.user.id}
                  className="flex items-center gap-1 bg-[#154d8f] rounded-full px-2.5 py-1 text-xs"
                >
                  {m.user.username}
                  <button
                    onClick={() => handleRemoveMember(group.id, m.user.id)}
                    className="text-[#93c5fd] hover:text-white ml-0.5"
                    aria-label={`Retirer ${m.user.username}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {group.members.length === 0 && (
                <span className="text-xs text-[#64748b]">Aucun membre</span>
              )}
            </div>

            {/* Add member */}
            {nonMembers.length > 0 && (
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) handleAddMember(group.id, e.target.value) }}
                className="bg-[#041629] border border-[#334155] rounded-lg px-3 py-1.5 text-xs
                           focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="">+ Ajouter un membre…</option>
                {nonMembers.map((u) => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            )}
          </div>
        )
      })}

      {groups.length === 0 && (
        <p className="text-center text-[#64748b] text-sm py-8">Aucun groupe créé</p>
      )}
    </div>
  )
}
