'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@domains/auth/services/token'
import { env } from '@shared/env'
import { SESSION_COOKIE_NAME } from '@constants/auth'
import type { SessionClaims } from '@domains/auth/entities/session-claims'
import type { User } from '@domains/auth/entities/user'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'

export async function getCurrentSession(): Promise<SessionClaims | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const claims = await verifyToken(token, env.AUTH_SECRET)
  return claims
}

export async function requireSession(returnTo?: string): Promise<SessionClaims> {
  const session = await getCurrentSession()

  if (!session) {
    const url = returnTo
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/login'
    redirect(url)
  }

  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession()

  if (!session) {
    return null
  }

  const provider = await getServerStorageProvider()
  const user = await provider.withTransaction(async (tx) => {
    const repos = await provider.getRepositorySet(tx)
    return repos.auth.findUserById(session.sub)
  })

  return user ?? null
}

export async function requireUser(returnTo?: string): Promise<User> {
  const session = await requireSession(returnTo)
  const user = await getCurrentUser()

  if (!user) {
    redirect(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login')
  }

  return user
}
