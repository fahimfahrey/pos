import { type NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@domains/auth/services/token'
import { SESSION_COOKIE_NAME } from '@constants/auth'
import { env } from '@shared/env'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  const pathname = request.nextUrl.pathname

  // Protected routes
  const protectedRoutes = ['/app', '/admin']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  // Auth pages
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      // Redirect to login with returnTo
      const returnTo = pathname + (request.nextUrl.search || '')
      const loginUrl = new URL(
        `/login?returnTo=${encodeURIComponent(returnTo)}`,
        request.url,
      )
      return NextResponse.redirect(loginUrl)
    }

    try {
      const claims = await verifyToken(token, env.AUTH_SECRET)

      if (!claims) {
        // Invalid or expired token
        const returnTo = pathname + (request.nextUrl.search || '')
        const loginUrl = new URL(
          `/login?returnTo=${encodeURIComponent(returnTo)}`,
          request.url,
        )
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete(SESSION_COOKIE_NAME)
        return response
      }
    } catch {
      // Error verifying token
      const returnTo = pathname + (request.nextUrl.search || '')
      const loginUrl = new URL(
        `/login?returnTo=${encodeURIComponent(returnTo)}`,
        request.url,
      )
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(SESSION_COOKIE_NAME)
      return response
    }
  }

  if (isAuthRoute) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (token) {
      try {
        const claims = await verifyToken(token, env.AUTH_SECRET)

        if (claims) {
          // User is logged in, redirect to app
          const appUrl = new URL('/app', request.url)
          return NextResponse.redirect(appUrl)
        }
      } catch {
        // Continue to auth page
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons).*)',
  ],
}
