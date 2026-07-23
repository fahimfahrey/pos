'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { hasher, tokenSigner, authRateLimiter, cookieSessionStore } from '@infra/auth/auth-container'
import { AuthService } from '@domains/auth/services/auth-service'
import { LoginInputSchema } from '@domains/auth/entities/credentials'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { DEFAULT_SETTINGS } from '@domains/organization/entities/settings'
import { sessionTtlSeconds } from '@domains/auth/services/session-timeout'

export async function logInAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ error?: string; errorKind?: 'user' | 'system'; returnTo?: string }> {
  try {
    const email = formData.get('email') as string | null
    const password = formData.get('password') as string | null
    const returnTo = formData.get('returnTo') as string | null

    const validationResult = LoginInputSchema.safeParse({ email, password })
    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid input',
        errorKind: 'user' as const,
        returnTo: returnTo || undefined,
      }
    }

    const input = validationResult.data
    const provider = await getServerStorageProvider()
    const settings = DEFAULT_SETTINGS
    const clock = new SystemClock()
    const ids = new UuidIdGenerator()

    const result = await provider.withTransaction(async (repos) => {
      const authService = new AuthService(repos.auth, hasher, tokenSigner, clock, ids, authRateLimiter)
      const signInResult = await authService.logIn(input, settings)

      // The token AuthService issues has no orgId — look up the user's organization
      // and re-issue a token that includes it, so /app resolves the right persona
      // instead of silently falling back to the most restrictive one.
      const memberships = await repos.organization.listMembershipsForUser(signInResult.user.id)
      const orgId = memberships[0]?.orgId
      if (!orgId) {
        return signInResult
      }

      const newSessionId = ids.next()
      const ttlSeconds = sessionTtlSeconds(settings)
      const expiresAt = new Date(clock.now().getTime() + ttlSeconds * 1000)
      const newToken = await tokenSigner.sign(
        { sub: signInResult.user.id, sessionId: newSessionId, orgId, roles: signInResult.user.roles },
        { ttlSeconds },
      )
      await repos.auth.saveSession({
        id: newSessionId,
        userId: signInResult.user.id,
        token: newToken,
        expiresAt,
        createdAt: clock.now(),
      })

      return { ...signInResult, token: newToken, session: { ...signInResult.session, expiresAt } }
    })

    // Set the session cookie
    await cookieSessionStore.set(result.token, result.session.expiresAt)

    // Revalidate paths
    revalidatePath('/app')
    revalidatePath('/login')

    // Redirect to the return-to or app
    const redirectTo = returnTo && returnTo.startsWith('/') ? returnTo : '/app'
    redirect(redirectTo)
  } catch (error) {
    unstable_rethrow(error)
    console.error('Log in error:', error)
    const message = error instanceof Error ? error.message : 'Log in failed'
    return { error: message, errorKind: 'system' as const, returnTo: undefined }
  }
}
