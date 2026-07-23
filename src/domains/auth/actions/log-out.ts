'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { tokenSigner, cookieSessionStore } from '@infra/auth/auth-container'
import { AuthService } from '@domains/auth/services/auth-service'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { verifyToken } from '@domains/auth/services/token'
import { env } from '@shared/env'

export async function logOutAction(): Promise<void> {
  try {
    const token = await cookieSessionStore.get()
    if (token) {
      const claims = await verifyToken(token, env.AUTH_SECRET)
      if (claims) {
        const provider = await getServerStorageProvider()
        const clock = new SystemClock()

        await provider.withTransaction(async (repos) => {
          const authService = new AuthService(
            repos.auth,
            {} as any,
            tokenSigner,
            clock,
            {} as any,
            {} as any,
          )
          await authService.logOut(claims.sessionId)
        })
      }
    }

    // Clear the session cookie
    await cookieSessionStore.clear()

    // Revalidate paths
    revalidatePath('/app')
    revalidatePath('/login')

    // Redirect to login
    redirect('/login')
  } catch (error) {
    unstable_rethrow(error)
    console.error('Log out error:', error)
    // Clear the cookie anyway
    try {
      await cookieSessionStore.clear()
    } catch {
      // Ignore
    }
    redirect('/login')
  }
}
