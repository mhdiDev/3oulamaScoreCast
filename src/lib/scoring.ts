export interface ScoreInput {
  homeScore: number
  awayScore: number
}

export interface ScoringRuleInput {
  exactScore: number
  closeResult: number
  correctResult: number
  wrongPrediction: number
}

export function calculatePoints(
  prediction: ScoreInput,
  result: ScoreInput,
  rule: ScoringRuleInput,
): number {
  const predDiff = prediction.homeScore - prediction.awayScore
  const realDiff = result.homeScore - result.awayScore
  const predWinner = Math.sign(predDiff)
  const realWinner = Math.sign(realDiff)

  // 3 pts — score exact
  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return rule.exactScore
  }

  // Mauvais résultat → 0
  if (predWinner !== realWinner) return rule.wrongPrediction

  // Bon vainqueur (ou nul) — vérifier si "proche" (2 pts)
  // Proche = score exact d'une équipe OU bon écart de buts
  const oneTeamExact =
    prediction.homeScore === result.homeScore ||
    prediction.awayScore === result.awayScore
  const correctGoalDiff = predDiff === realDiff

  if (oneTeamExact || correctGoalDiff) return rule.closeResult

  // Bon résultat simple → 1 pt
  return rule.correctResult
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
