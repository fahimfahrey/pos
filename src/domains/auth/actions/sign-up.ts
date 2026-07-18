'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { hasher, tokenSigner, authRateLimiter, cookieSessionStore } from '@infra/auth/auth-container'
import { AuthService } from '@domains/auth/services/auth-service'
import { SignupInputSchema } from '@domains/auth/entities/credentials'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { getResolvedSettings } from '@domains/organization/services/settings-resolver'

export async function signUpAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const email = formData.get('email') as string | null
    const username = formData.get('username') as string | null
    const password = formData.get('password') as string | null

    const validationResult = SignupInputSchema.safeParse({ email, username, password })
    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid input',
      }
    }

    const input = validationResult.data
    const provider = await getServerStorageProvider()
    const settings = getResolvedSettings({})
    const clock = new SystemClock()
    const ids = new UuidIdGenerator()

    const result = await provider.withTransaction(async (tx) => {
      const repos = await provider.getRepositorySet(tx)
      const authService = new AuthService(repos.auth, hasher, tokenSigner, clock, ids, authRateLimiter)
      return authService.signUp(input, settings)
    })

    // Set the session cookie
    await cookieSessionStore.set(result.token, result.session.expiresAt)

    // Revalidate paths
    revalidatePath('/app')
    revalidatePath('/login')

    // Redirect to the app
    redirect('/app')
  } catch (error) {
    console.error('Sign up error:', error)
    const message = error instanceof Error ? error.message : 'Sign up failed'
    return { error: message }
  }
}
