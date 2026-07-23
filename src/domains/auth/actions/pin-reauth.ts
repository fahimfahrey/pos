'use server'

import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { hasher, tokenSigner, authRateLimiter, cookieSessionStore } from '@infra/auth/auth-container'
import { AuthService } from '@domains/auth/services/auth-service'
import { PinReauthInputSchema } from '@domains/auth/entities/credentials'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { DEFAULT_SETTINGS } from '@domains/organization/entities/settings'
import { verifyToken } from '@domains/auth/services/token'
import { env } from '@shared/env'

export async function pinReauthAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const pin = formData.get('pin') as string | null

    const validationResult = PinReauthInputSchema.safeParse({ pin })
    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid input',
      }
    }

    // Get the current user from the session
    const token = await cookieSessionStore.get()
    if (!token) {
      return { error: 'No active session' }
    }

    const claims = await verifyToken(token, env.AUTH_SECRET)
    if (!claims) {
      return { error: 'Invalid session' }
    }

    const input = validationResult.data
    const provider = await getServerStorageProvider()
    const settings = DEFAULT_SETTINGS
    const clock = new SystemClock()
    const ids = new UuidIdGenerator()

    const result = await provider.withTransaction(async (repos) => {
      const authService = new AuthService(repos.auth, hasher, tokenSigner, clock, ids, authRateLimiter)
      return authService.reauthWithPin(claims.sub, input.pin, settings)
    })

    // Update the session cookie
    await cookieSessionStore.set(result.token, result.session.expiresAt)

    return { success: true }
  } catch (error) {
    console.error('PIN reauth error:', error)
    const message = error instanceof Error ? error.message : 'PIN reauth failed'
    return { error: message }
  }
}
