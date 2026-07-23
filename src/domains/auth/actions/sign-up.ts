'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { hasher, tokenSigner, authRateLimiter, cookieSessionStore } from '@infra/auth/auth-container'
import { AuthService } from '@domains/auth/services/auth-service'
import { SignupInputSchema } from '@domains/auth/entities/credentials'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { DEFAULT_SETTINGS } from '@domains/organization/entities/settings'

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
    const settings = DEFAULT_SETTINGS
    const clock = new SystemClock()
    const ids = new UuidIdGenerator()

    const result = await provider.withTransaction(async (repos) => {
      const authService = new AuthService(repos.auth, hasher, tokenSigner, clock, ids, authRateLimiter)
      return authService.signUp(input, settings)
    })

    // Set the session cookie
    await cookieSessionStore.set(result.token, result.session.expiresAt)

    // Revalidate paths
    revalidatePath('/app')
    revalidatePath('/login')

    // A brand-new account has no organization yet — send them to onboarding to create one
    redirect('/onboarding')
  } catch (error) {
    unstable_rethrow(error)
    console.error('Sign up error:', error)
    const message = error instanceof Error ? error.message : 'Sign up failed'
    return { error: message }
  }
}
