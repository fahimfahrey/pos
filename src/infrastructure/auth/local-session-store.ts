'use client'

import type { SessionStore } from '@shared/ports/session-store'

const STORAGE_KEY = 'pos_session_token'
const EXPIRES_AT_KEY = 'pos_session_expires_at'

export class LocalSessionStore implements SessionStore {
  async set(token: string, expiresAt: Date): Promise<void> {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, token)
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toISOString())
  }

  async get(): Promise<string | null> {
    if (typeof localStorage === 'undefined') return null
    const token = localStorage.getItem(STORAGE_KEY)
    const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY)

    if (!token || !expiresAtStr) return null

    const expiresAt = new Date(expiresAtStr)
    if (expiresAt < new Date()) {
      await this.clear()
      return null
    }

    return token
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(EXPIRES_AT_KEY)
  }
}
