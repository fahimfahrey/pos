'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { RouteError } from '@shared/components/ui/route-error'
import { OfflineBanner } from '@shared/components/ui/offline-banner'
import { useOnlineStatus } from '@/app/pos/checkout/_lib/use-online-status'
import { signUpAction } from '@domains/auth/actions/sign-up'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUpAction, {})
  const isOnline = useOnlineStatus()

  return (
    <div className="space-y-6">
      <OfflineBanner isOnline={isOnline} />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-gray-600">Sign up to get started</p>
      </div>

      <form action={action} className="space-y-4">
        {state.error && (
          <RouteError
            title="Sign up failed"
            message={state.error}
            kind="system"
            inline
            showAlert={false}
          />
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="john_doe"
            required
            minLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none"
            disabled={pending}
          />
        </div>

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
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none"
            disabled={pending}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          aria-busy={pending}
        >
          {pending ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
