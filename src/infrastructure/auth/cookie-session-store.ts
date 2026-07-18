import { cookies } from 'next/headers'
import type { SessionStore } from '@shared/ports/session-store'
import { SESSION_COOKIE_NAME, getCookieOptions } from '@constants/auth'

export class CookieSessionStore implements SessionStore {
  async set(token: string, expiresAt: Date): Promise<void> {
    const ttlSeconds = Math.max(
      0,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    )
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, getCookieOptions(ttlSeconds))
  }

  async get(): Promise<string | null> {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(SESSION_COOKIE_NAME)
    return cookie?.value ?? null
  }

  async clear(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}
