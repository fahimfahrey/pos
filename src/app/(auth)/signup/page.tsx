'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpAction } from '@domains/auth/actions/sign-up'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUpAction, {})

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-gray-600">Sign up to get started</p>
      </div>

      <form action={action} className="space-y-4">
        {state.error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            {state.error}
          </div>
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
