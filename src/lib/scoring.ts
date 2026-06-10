export interface ScoreInput {
  homeScore: number
  awayScore: number
}

export interface ScoringRuleInput {
  exactScore: number
  correctResult: number
  wrongPrediction: number
}

export function calculatePoints(
  prediction: ScoreInput,
  result: ScoreInput,
  rule: ScoringRuleInput,
): number {
  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return rule.exactScore
  }

  const predictedWinner = Math.sign(prediction.homeScore - prediction.awayScore)
  const actualWinner = Math.sign(result.homeScore - result.awayScore)

  if (predictedWinner === actualWinner) return rule.correctResult

  return rule.wrongPrediction
}

export function computeStreak(
  predictions: Array<{ points: number | null }>,
  exactThreshold: number,
): number {
  let streak = 0
  for (const p of [...predictions].reverse()) {
    if (p.points !== null && p.points > 0) streak++
    else break
  }
  return streak
}
