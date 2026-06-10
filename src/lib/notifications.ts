import { Resend } from 'resend'
import webpush from 'web-push'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

interface NotifyPayload {
  userId: string
  matchId: string
  type: 'REMINDER' | 'RESULT'
  subject: string
  html: string
  pushTitle: string
  pushBody: string
}

export async function sendNotification(payload: NotifyPayload) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: payload.userId },
  })

  // Check for duplicate
  const alreadySent = await prisma.notificationLog.findFirst({
    where: {
      userId:  payload.userId,
      matchId: payload.matchId,
      type:    payload.type,
      status:  'SENT',
    },
  })
  if (alreadySent) return

  // Email
  if (user.emailNotifications) {
    try {
      await resend.emails.send({
        from:    'ScoreCast <no-reply@scorecast.app>',
        to:      user.email,
        subject: payload.subject,
        html:    payload.html,
      })
      await prisma.notificationLog.create({
        data: {
          userId:  payload.userId,
          matchId: payload.matchId,
          type:    payload.type,
          channel: 'EMAIL',
          status:  'SENT',
        },
      })
    } catch {
      await prisma.notificationLog.create({
        data: {
          userId:  payload.userId,
          matchId: payload.matchId,
          type:    payload.type,
          channel: 'EMAIL',
          status:  'FAILED',
        },
      })
    }
  }

  // Push
  if (user.pushSubscription) {
    try {
      await webpush.sendNotification(
        user.pushSubscription as any,
        JSON.stringify({ title: payload.pushTitle, body: payload.pushBody }),
      )
      await prisma.notificationLog.create({
        data: {
          userId:  payload.userId,
          matchId: payload.matchId,
          type:    payload.type,
          channel: 'PUSH',
          status:  'SENT',
        },
      })
    } catch (err: any) {
      // 410 = subscription expired → clear it
      if (err?.statusCode === 410) {
        await prisma.user.update({
          where: { id: payload.userId },
          data:  { pushSubscription: Prisma.JsonNull },
        })
      }
      await prisma.notificationLog.create({
        data: {
          userId:  payload.userId,
          matchId: payload.matchId,
          type:    payload.type,
          channel: 'PUSH',
          status:  'FAILED',
        },
      })
    }
  }
}
