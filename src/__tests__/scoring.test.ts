import { calculatePoints, computeStreak } from '@/lib/scoring'

const rule = { exactScore: 3, correctResult: 1, wrongPrediction: 0 }

describe('calculatePoints', () => {
  it('returns exactScore for exact match', () => {
    expect(calculatePoints({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 }, rule)).toBe(3)
  })

  it('returns exactScore for 0-0 exact match', () => {
    expect(calculatePoints({ homeScore: 0, awayScore: 0 }, { homeScore: 0, awayScore: 0 }, rule)).toBe(3)
  })

  it('returns correctResult for correct home win', () => {
    expect(calculatePoints({ homeScore: 3, awayScore: 1 }, { homeScore: 1, awayScore: 0 }, rule)).toBe(1)
  })

  it('returns correctResult for correct away win', () => {
    expect(calculatePoints({ homeScore: 0, awayScore: 2 }, { homeScore: 1, awayScore: 3 }, rule)).toBe(1)
  })

  it('returns correctResult for correct draw', () => {
    expect(calculatePoints({ homeScore: 1, awayScore: 1 }, { homeScore: 0, awayScore: 0 }, rule)).toBe(1)
  })

  it('returns wrongPrediction for wrong result (predicted home win, actual draw)', () => {
    expect(calculatePoints({ homeScore: 2, awayScore: 1 }, { homeScore: 1, awayScore: 1 }, rule)).toBe(0)
  })

  it('returns wrongPrediction for wrong result (predicted draw, actual away win)', () => {
    expect(calculatePoints({ homeScore: 1, awayScore: 1 }, { homeScore: 0, awayScore: 1 }, rule)).toBe(0)
  })

  it('returns wrongPrediction for completely wrong (predicted home win, actual away win)', () => {
    expect(calculatePoints({ homeScore: 2, awayScore: 0 }, { homeScore: 0, awayScore: 3 }, rule)).toBe(0)
  })

  it('respects custom rule values', () => {
    const custom = { exactScore: 5, correctResult: 2, wrongPrediction: -1 }
    expect(calculatePoints({ homeScore: 1, awayScore: 0 }, { homeScore: 1, awayScore: 0 }, custom)).toBe(5)
    expect(calculatePoints({ homeScore: 2, awayScore: 0 }, { homeScore: 1, awayScore: 0 }, custom)).toBe(2)
    expect(calculatePoints({ homeScore: 0, awayScore: 1 }, { homeScore: 1, awayScore: 0 }, custom)).toBe(-1)
  })
})

describe('computeStreak', () => {
  it('returns 0 for empty list', () => {
    expect(computeStreak([], 3)).toBe(0)
  })

  it('counts consecutive non-zero points from the end', () => {
    const preds = [
      { points: 0 },
      { points: 1 },
      { points: 3 },
      { points: 1 },
    ]
    expect(computeStreak(preds, 3)).toBe(3)
  })

  it('resets streak on 0 points', () => {
    const preds = [
      { points: 3 },
      { points: 0 },
      { points: 1 },
    ]
    expect(computeStreak(preds, 3)).toBe(1)
  })

  it('returns 0 if last prediction is 0 points', () => {
    const preds = [{ points: 3 }, { points: 0 }]
    expect(computeStreak(preds, 3)).toBe(0)
  })

  it('handles null points (not yet calculated)', () => {
    const preds = [{ points: 3 }, { points: null }]
    expect(computeStreak(preds, 3)).toBe(0)
  })
})
