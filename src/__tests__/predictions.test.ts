/**
 * Integration tests for prediction API.
 * These tests use an in-memory mock of Prisma to avoid a real DB connection.
 */

import { calculatePoints } from '@/lib/scoring'

const defaultRule = { exactScore: 3, correctResult: 1, wrongPrediction: 0 }

describe('Prediction scoring integration', () => {
  it('returns exact score points when score matches', () => {
    expect(calculatePoints({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 }, defaultRule)).toBe(3)
  })

  it('returns correct result points on correct winner but wrong score', () => {
    expect(calculatePoints({ homeScore: 2, awayScore: 0 }, { homeScore: 1, awayScore: 0 }, defaultRule)).toBe(1)
  })

  it('returns 0 on wrong result', () => {
    expect(calculatePoints({ homeScore: 0, awayScore: 2 }, { homeScore: 2, awayScore: 0 }, defaultRule)).toBe(0)
  })

  it('handles custom rule values', () => {
    const customRule = { exactScore: 5, correctResult: 2, wrongPrediction: -1 }
    expect(calculatePoints({ homeScore: 1, awayScore: 1 }, { homeScore: 1, awayScore: 1 }, customRule)).toBe(5)
    expect(calculatePoints({ homeScore: 1, awayScore: 0 }, { homeScore: 2, awayScore: 0 }, customRule)).toBe(2)
    expect(calculatePoints({ homeScore: 0, awayScore: 1 }, { homeScore: 1, awayScore: 0 }, customRule)).toBe(-1)
  })
})
