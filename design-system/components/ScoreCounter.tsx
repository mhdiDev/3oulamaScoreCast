'use client'
import { useId } from 'react'

interface ScoreCounterProps {
  value: number
  onChange: (v: number) => void
  teamName: string
  flagEmoji: string
  min?: number
  max?: number
  disabled?: boolean
}

export function ScoreCounter({
  value, onChange, teamName, flagEmoji, min = 0, max = 20, disabled,
}: ScoreCounterProps) {
  const id = useId()

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
        <span aria-hidden>{flagEmoji}</span>
        <span>{teamName}</span>
      </div>

      <div
        role="group"
        aria-label={`Score ${teamName}`}
        className="flex flex-col items-center gap-1.5"
      >
        <button
          aria-label={`Augmenter score ${teamName}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          className="w-9 h-8 rounded-md bg-pitch-700 border border-border text-white
                     hover:bg-pitch-600 active:bg-pitch-800
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-fast
                     focus-visible:outline-2 focus-visible:outline-pitch-400"
        >
          +
        </button>

        <output
          id={id}
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${value} buts pour ${teamName}`}
          className="bg-pitch-900 rounded-lg px-4 py-2 text-4xl font-extrabold
                     tabular-nums min-w-[52px] text-center leading-none
                     transition-all duration-fast animate-score-pop"
        >
          {value}
        </output>

        <button
          aria-label={`Diminuer score ${teamName}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          className="w-9 h-8 rounded-md bg-pitch-700 border border-border text-white
                     hover:bg-pitch-600 active:bg-pitch-800
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-fast
                     focus-visible:outline-2 focus-visible:outline-pitch-400"
        >
          −
        </button>
      </div>
    </div>
  )
}
