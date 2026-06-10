import { calculatePoints, computeStreak } from '@/lib/scoring'

const rule = { exactScore: 3, closeResult: 2, correctResult: 1, wrongPrediction: 0 }

describe('Leaderboard calculation helpers', () => {
  describe('computeStreak', () => {
    it('counts consecutive non-zero from end', () => {
      const preds = [
        { homeScore: 1, awayScore: 0, points: 3 },
        { homeScore: 1, awayScore: 0, points: 1 },
        { homeScore: 1, awayScore: 0, points: 3 },
      ]
      expect(computeStreak(preds, 3)).toBe(3)
    })

    it('stops at zero', () => {
      const preds = [
        { homeScore: 1, awayScore: 0, points: 3 },
        { homeScore: 0, awayScore: 1, points: 0 },
        { homeScore: 1, awayScore: 0, points: 3 },
        { homeScore: 1, awayScore: 0, points: 1 },
      ]
      expect(computeStreak(preds, 3)).toBe(2)
    })

    it('returns 0 for empty predictions', () => {
      expect(computeStreak([], 3)).toBe(0)
    })

    it('returns 0 when last prediction is zero', () => {
      const preds = [
        { homeScore: 1, awayScore: 0, points: 3 },
        { homeScore: 0, awayScore: 1, points: 0 },
      ]
      expect(computeStreak(preds, 3)).toBe(0)
    })
  })

  describe('total points', () => {
    it('sums points correctly across matches', () => {
      const preds = [
        { homeScore: 2, awayScore: 1 },
        { homeScore: 1, awayScore: 0 },
        { homeScore: 0, awayScore: 2 },
      ]
      const results = [
        { homeScore: 2, awayScore: 1 },
        { homeScore: 2, awayScore: 0 },
        { homeScore: 2, awayScore: 0 },
      ]
      const total = preds.reduce((sum, p, i) => sum + calculatePoints(p, results[i], rule), 0)
      expect(total).toBe(4) // 3 + 1 + 0
    })
  })
})
