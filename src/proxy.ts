import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/invite',
  '/api/auth',
  '/api/health',
]

export function proxy(req: NextRequest) {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Check for NextAuth session cookie
  const sessionCookie =
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token')

  if (!isPublic && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Cron guard
  if (pathname.startsWith('/api/cron')) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon).*)'],
}
