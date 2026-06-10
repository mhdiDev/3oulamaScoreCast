import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'

export async function POST() {
  const now    = new Date()
  const in1h   = new Date(now.getTime() + 60 * 60 * 1000)
  const in24h  = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in25h  = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  // Matchs dans les fenêtres 1h et 24h
  const upcomingMatches = await prisma.match.findMany({
    where: {
      status: 'SCHEDULED',
      OR: [
        { kickoffAt: { gte: now,   lte: in1h  } },
        { kickoffAt: { gte: in24h, lte: in25h } },
      ],
    },
    include: { homeTeam: true, awayTeam: true },
  })

  let sent = 0
  const users = await prisma.user.findMany({ select: { id: true } })

  for (const match of upcomingMatches) {
    for (const user of users) {
      const hasPrediction = await prisma.prediction.findUnique({
        where: { userId_matchId: { userId: user.id, matchId: match.id } },
      })
      if (hasPrediction) continue

      const isIn1h = match.kickoffAt <= in1h
      const label  = isIn1h ? '1 heure' : '24 heures'

      await sendNotification({
        userId:    user.id,
        matchId:   match.id,
        type:      'REMINDER',
        subject:   `⚽ Pronostique ${match.homeTeam.name} vs ${match.awayTeam.name} — dans ${label}`,
        html:      `<p>Le match <strong>${match.homeTeam.name} vs ${match.awayTeam.name}</strong> commence dans ${label}. Tu n'as pas encore pronostiqué !</p>`,
        pushTitle: `⚽ Match dans ${label}`,
        pushBody:  `${match.homeTeam.name} vs ${match.awayTeam.name} — Pronostique maintenant !`,
      })
      sent++
    }
  }

  return NextResponse.json({ sent })
}
