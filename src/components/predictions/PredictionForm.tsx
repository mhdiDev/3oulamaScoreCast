'use client'
import { useState } from 'react'
import { ScoreCounter } from './ScoreCounter'
import { useRouter } from 'next/navigation'

interface PredictionFormProps {
  matchId: string
  homeTeam: { name: string }
  awayTeam: { name: string }
  cutoffAt: Date
  initialHome?: number
  initialAway?: number
  disabled?: boolean
}

export function PredictionForm({
  matchId, homeTeam, awayTeam, cutoffAt,
  initialHome = 1, initialAway = 1, disabled,
}: PredictionFormProps) {
  const [home, setHome] = useState(initialHome)
  const [away, setAway] = useState(initialAway)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isPast = new Date() >= new Date(cutoffAt)
  const isDisabled = disabled || isPast || saving

  const outcome =
    home > away ? `Victoire ${homeTeam.name}` :
    away > home ? `Victoire ${awayTeam.name}` : 'Match nul'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/predictions/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeScore: home, awayScore: away }),
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
    <form onSubmit={handleSubmit} className="bg-[#0a2540] border border-[#334155] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#94a3b8] mb-4 text-center">Ton pronostic</h2>

      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="text-center">
          <div className="text-sm font-semibold mb-3">{homeTeam.name}</div>
          <ScoreCounter value={home} onChange={setHome} teamName={homeTeam.name} disabled={isDisabled} />
        </div>
        <div className="text-[#64748b] text-xl font-light pb-4">—</div>
        <div className="text-center">
          <div className="text-sm font-semibold mb-3">{awayTeam.name}</div>
          <ScoreCounter value={away} onChange={setAway} teamName={awayTeam.name} disabled={isDisabled} />
        </div>
      </div>

      <div className="bg-[#041629] rounded-lg px-4 py-2 text-center text-sm text-[#93c5fd] mb-4">
        {outcome} — peut valoir 1 ou 3 pts
      </div>

      {isPast ? (
        <p className="text-center text-sm text-[#64748b]">Coupure dépassée — pronostic verrouillé</p>
      ) : (
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-[#f59e0b] text-[#020d1a] font-bold py-3 rounded-xl
                     hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors focus-visible:outline-2 focus-visible:outline-[#3b82f6]"
        >
          {saving ? 'Enregistrement…' : saved ? '✓ Enregistré !' : 'Confirmer le pronostic'}
        </button>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-red-400 mt-2">{error}</p>
      )}

      {!isPast && (
        <p className="text-center text-xs text-[#64748b] mt-2">
          ⏱ Coupure : {new Date(cutoffAt).toLocaleString('fr-FR', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}
    </form>
  )
}
