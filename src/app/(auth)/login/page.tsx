'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { RouteError } from '@shared/components/ui/route-error'
import { OfflineBanner } from '@shared/components/ui/offline-banner'
import { useOnlineStatus } from '@/app/pos/checkout/_lib/use-online-status'
import { logInAction } from '@domains/auth/actions/log-in'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || ''
  const [state, action, pending] = useActionState(logInAction, {})
  const isOnline = useOnlineStatus()

  return (
    <div className="space-y-6">
      <OfflineBanner isOnline={isOnline} />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-gray-600">Enter your credentials to continue</p>
      </div>

      <form action={action} className="space-y-4">
        {state.error && (
          <RouteError
            title={state.errorKind === 'user' ? 'Sign in failed' : 'Something went wrong'}
            message={state.error}
            kind={state.errorKind || 'system'}
            inline
            showAlert={false}
          />
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none"
            disabled={pending}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none"
            disabled={pending}
          />
        </div>

        {returnTo && (
          <input type="hidden" name="returnTo" value={returnTo} />
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          aria-busy={pending}
        >
          {pending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm space-y-2">
        <p>
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
        <Link href="/" className="text-blue-600 hover:underline block">
          Back to home
        </Link>
      </div>
    </div>
  )
}
