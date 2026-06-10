import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',           type: 'email' },
        password: { label: 'Mot de passe',    type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.passwordHash) return null

        const valid = await compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return {
          id:        user.id,
          email:     user.email,
          name:      user.username,
          role:      user.role,
          locale:    user.locale,
          avatarUrl: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in: create user if doesn't exist
      if (account?.provider === 'google' && user.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } })

        if (!dbUser) {
          // Generate a unique username from the Google display name
          const baseName = (user.name ?? user.email.split('@')[0])
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 40) || 'user'

          let username = baseName
          let attempt = 0
          while (await prisma.user.findUnique({ where: { username } })) {
            attempt++
            username = `${baseName}${attempt}`
          }

          dbUser = await prisma.user.create({
            data: {
              email:     user.email,
              username,
              avatarUrl: user.image ?? null,
            },
          })
        }

        // Attach DB fields to the token via user object
        ;(user as any).id        = dbUser.id
        ;(user as any).role      = dbUser.role
        ;(user as any).locale    = dbUser.locale
        ;(user as any).avatarUrl = dbUser.avatarUrl ?? user.image ?? null
        ;(user as any).name      = dbUser.username
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id
        token.role      = (user as any).role
        token.locale    = (user as any).locale
        token.avatarUrl = (user as any).avatarUrl
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id        = token.id as string
        session.user.role      = token.role as string
        session.user.locale    = token.locale as string
        session.user.avatarUrl = token.avatarUrl as string | null
      }
      return session
    },
  },
})
