'use client'

import { Spinner } from '@shared/components/ui/spinner'
import { useDelayedVisible } from '@shared/utils/motion'
import { useOldestPendingAge } from '../_lib/register-outbox'

export function SyncProgressIndicator() {
  const pendingAge = useOldestPendingAge()
  const showProgress = useDelayedVisible(pendingAge > 0)

  if (!showProgress) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 ml-2"
    >
      <Spinner size="sm" />
      <span className="text-xs text-foreground">Syncing…</span>
    </div>
  )
}
