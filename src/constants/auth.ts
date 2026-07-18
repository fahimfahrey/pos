import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export const SESSION_COOKIE_NAME = 'pos_session'

export const AUTH_ERROR = {
  INVALID_CREDENTIALS: 'invalid-credentials',
  EMAIL_TAKEN: 'email-taken',
  USERNAME_TAKEN: 'username-taken',
  RATE_LIMITED: 'rate-limited',
  SESSION_EXPIRED: 'session-expired',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  USER_NOT_FOUND: 'user-not-found',
  INVALID_PIN: 'invalid-pin',
} as const

export function getCookieOptions(ttlSeconds: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ttlSeconds,
  }
}

export const DEFAULT_SESSION_TIMEOUT_MINUTES = 480
export const DEFAULT_PIN_REAUTH_TIMEOUT_MINUTES = 15
export const DEFAULT_MAX_AUTH_ATTEMPTS = 5
export const DEFAULT_AUTH_WINDOW_MINUTES = 15
