import { prisma } from '@/lib/prisma'
import { calculatePoints, computeStreak } from '@/lib/scoring'

export async function recomputeLeaderboard() {
  const rule = await prisma.scoringRule.findUniqueOrThrow({ where: { id: 1 } })
  const users = await prisma.user.findMany({ select: { id: true } })
  const groups = await prisma.group.findMany({ select: { id: true } })

  for (const user of users) {
    const predictions = await prisma.prediction.findMany({
      where: { userId: user.id, points: { not: null } },
      orderBy: { match: { kickoffAt: 'asc' } },
      include: { match: true },
    })

    const totalPoints    = predictions.reduce((s, p) => s + (p.points ?? 0), 0)
    const exactScores    = predictions.filter((p) => p.points === rule.exactScore).length
    const correctResults = predictions.filter(
      (p) => p.points !== null && p.points > 0 && p.points < rule.exactScore,
    ).length
    const currentStreak = computeStreak(predictions, rule.exactScore)

    // Global snapshot (groupId = null)
    await prisma.leaderboardSnapshot.upsert({
      where:  { userId_groupId: { userId: user.id, groupId: null as any } },
      create: { userId: user.id, groupId: null, totalPoints, exactScores, correctResults, currentStreak, rank: 0 },
      update: { totalPoints, exactScores, correctResults, currentStreak, computedAt: new Date() },
    })
  }

  // Compute ranks globally
  await assignRanks(null)

  // Per-group snapshots
  for (const group of groups) {
    const members = await prisma.groupMember.findMany({
      where: { groupId: group.id },
      select: { userId: true },
    })
    const memberIds = members.map((m) => m.userId)

    for (const userId of memberIds) {
      const predictions = await prisma.prediction.findMany({
        where: { userId, points: { not: null } },
        include: { match: true },
      })
      const totalPoints    = predictions.reduce((s, p) => s + (p.points ?? 0), 0)
      const exactScores    = predictions.filter((p) => p.points === rule.exactScore).length
      const correctResults = predictions.filter(
        (p) => p.points !== null && p.points > 0 && p.points < rule.exactScore,
      ).length
      const currentStreak = computeStreak(predictions, rule.exactScore)

      await prisma.leaderboardSnapshot.upsert({
        where:  { userId_groupId: { userId, groupId: group.id } },
        create: { userId, groupId: group.id, totalPoints, exactScores, correctResults, currentStreak, rank: 0 },
        update: { totalPoints, exactScores, correctResults, currentStreak, computedAt: new Date() },
      })
    }
    await assignRanks(group.id)
  }
}

async function assignRanks(groupId: string | null) {
  const snapshots = await prisma.leaderboardSnapshot.findMany({
    where: { groupId: groupId ?? null },
    orderBy: [{ totalPoints: 'desc' }, { exactScores: 'desc' }],
  })
  for (let i = 0; i < snapshots.length; i++) {
    await prisma.leaderboardSnapshot.update({
      where: { userId_groupId: { userId: snapshots[i].userId, groupId: snapshots[i].groupId ?? null as any } },
      data:  { rank: i + 1 },
    })
  }
}
