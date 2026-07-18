'use client'

import type { SessionClaims } from '@domains/auth/entities/session-claims'
import { verifyToken } from '@domains/auth/services/token'
import { LocalSessionStore } from '@infra/auth/local-session-store'

/**
 * Offline authentication for pure-offline PWA/terminal builds.
 * Uses localStorage + browser IndexedDB for token persistence.
 * Reuses the shared verifyToken function with the same code path as server auth.
 */

const sessionStore = new LocalSessionStore()

export async function offlineLogin(token: string, expiresAt: Date): Promise<void> {
  await sessionStore.set(token, expiresAt)
}

export async function offlineGetSession(secret: string): Promise<SessionClaims | null> {
  const token = await sessionStore.get()
  if (!token) return null
  return verifyToken(token, secret)
}

export async function offlineLogout(): Promise<void> {
  await sessionStore.clear()
}

export async function offlineCheckSession(secret: string): Promise<boolean> {
  const claims = await offlineGetSession(secret)
  return claims !== null
}
