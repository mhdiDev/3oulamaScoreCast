'use client'
import { useId } from 'react'

interface ScoreCounterProps {
  value: number
  onChange: (v: number) => void
  teamName: string
  disabled?: boolean
}

export function ScoreCounter({ value, onChange, teamName, disabled }: ScoreCounterProps) {
  const outputId = useId()
  return (
    <div className="flex flex-col items-center gap-1.5" role="group" aria-label={`Score ${teamName}`}>
      <button
        type="button"
        aria-label={`Augmenter score ${teamName}`}
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={disabled || value >= 20}
        className="w-10 h-9 rounded-lg bg-[#0e3460] border border-[#334155] text-white text-lg
                   hover:bg-[#154d8f] disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors focus-visible:outline-2 focus-visible:outline-[#3b82f6]"
      >+</button>
      <output
        id={outputId}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${value} buts pour ${teamName}`}
        className="bg-[#041629] rounded-xl px-5 py-2 text-4xl font-extrabold
                   tabular-nums min-w-[60px] text-center leading-none"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={`Diminuer score ${teamName}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value <= 0}
        className="w-10 h-9 rounded-lg bg-[#0e3460] border border-[#334155] text-white text-lg
                   hover:bg-[#154d8f] disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors focus-visible:outline-2 focus-visible:outline-[#3b82f6]"
      >−</button>
    </div>
  )
}
