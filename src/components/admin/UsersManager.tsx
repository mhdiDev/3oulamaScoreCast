'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: Date | string
  _count: { predictions: number }
}

export function UsersManager({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleRole(user: User) {
    setLoading(user.id)
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    router.refresh()
    setLoading(null)
  }

  async function deleteUser(user: User) {
    if (!confirm(`Supprimer ${user.username} ? Cette action est irréversible.`)) return
    setLoading(user.id)
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const isMe = user.id === currentUserId
        const busy = loading === user.id
        return (
          <div key={user.id} className={`bg-[#0a2540] border rounded-xl px-4 py-3 ${isMe ? 'border-[#3b82f6]' : 'border-[#334155]'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#154d8f] flex items-center justify-center text-xs font-bold shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{user.username}</span>
                  {isMe && <span className="text-xs text-[#3b82f6]">(toi)</span>}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    user.role === 'ADMIN' ? 'bg-[#451a03] text-[#fde68a]' : 'bg-[#1e293b] text-[#64748b]'
                  }`}>
                    {user.role === 'ADMIN' ? 'Admin' : 'Joueur'}
                  </span>
                </div>
                <div className="text-xs text-[#64748b] truncate">
                  {user.email} · {user._count.predictions} pronostics
                </div>
              </div>
              {!isMe && (
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleRole(user)}
                    disabled={busy}
                    className="px-2 py-1 bg-[#0e3460] border border-[#334155] rounded-lg text-xs hover:border-[#3b82f6] disabled:opacity-50"
                  >
                    {busy ? '…' : user.role === 'ADMIN' ? '→ Joueur' : '→ Admin'}
                  </button>
                  <button
                    onClick={() => deleteUser(user)}
                    disabled={busy}
                    className="px-2 py-1 bg-[#1c0606] border border-[#7f1d1d] rounded-lg text-xs text-red-400 hover:border-red-500 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
