'use client'

import { logOutAction } from '@domains/auth/actions/log-out'

export default function LogoutButton() {
  return (
    <form action={logOutAction}>
      <button
        type="submit"
        className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </form>
  )
}
