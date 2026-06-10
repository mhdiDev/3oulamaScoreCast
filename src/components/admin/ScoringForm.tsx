'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ScoringRule {
  exactScore: number
  correctResult: number
  wrongPrediction: number
}

export function ScoringForm({ rule }: { rule: ScoringRule }) {
  const [exact, setExact] = useState(rule.exactScore)
  const [correct, setCorrect] = useState(rule.correctResult)
  const [wrong, setWrong] = useState(rule.wrongPrediction)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/scoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exactScore: exact, correctResult: correct, wrongPrediction: wrong }),
      })
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { label: 'Score exact', value: exact, set: setExact, color: 'text-[#fde68a]', desc: 'Ex: 2-1 prédit, 2-1 réel' },
    { label: 'Bon résultat', value: correct, set: setCorrect, color: 'text-[#86efac]', desc: 'Ex: victoire prédite, victoire réelle' },
    { label: 'Mauvais pronostic', value: wrong, set: setWrong, color: 'text-[#64748b]', desc: 'Résultat incorrect' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.label} className="bg-[#0a2540] border border-[#334155] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className={`font-semibold text-sm ${f.color}`}>{f.label}</div>
              <div className="text-xs text-[#64748b]">{f.desc}</div>
            </div>
            <input
              type="number"
              value={f.value}
              onChange={(e) => f.set(parseInt(e.target.value, 10))}
              min={0}
              max={10}
              required
              className="w-16 bg-[#041629] border border-[#334155] rounded-lg px-3 py-2 text-center font-bold
                         focus:outline-none focus:border-[#3b82f6] text-lg"
            />
          </div>
        </div>
      ))}

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#f59e0b] text-[#020d1a] font-bold py-3 rounded-xl
                   hover:bg-[#fbbf24] disabled:opacity-50 transition-colors"
      >
        {saving ? 'Enregistrement…' : saved ? '✓ Barème mis à jour !' : 'Sauvegarder le barème'}
      </button>
    </form>
  )
}
