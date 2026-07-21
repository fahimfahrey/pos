'use client'

import { RouteError } from '@shared/components/ui/route-error'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Failed to load dashboard"
      message="Unable to retrieve dashboard data. Your data on this device is safe. Please try again."
      kind="system"
      retry={reset}
      showAlert
    />
  )
}
