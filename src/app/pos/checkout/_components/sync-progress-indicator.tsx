'use client'

import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@shared/components/ui/spinner'
import { useDelayedVisible } from '@shared/utils/motion'
import { useOldestPendingAge } from '../_lib/register-outbox'
import { useTranslations } from '@shared/i18n'

const SYNCED_MESSAGE_DURATION_MS = 2000

export function SyncProgressIndicator() {
  const pendingAge = useOldestPendingAge()
  const showProgress = useDelayedVisible(pendingAge > 0)
  const [justSynced, setJustSynced] = useState(false)
  const wasPendingRef = useRef(false)
  const t = useTranslations()

  useEffect(() => {
    if (pendingAge > 0) {
      wasPendingRef.current = true
      setJustSynced(false)
      return
    }

    if (wasPendingRef.current) {
      wasPendingRef.current = false
      setJustSynced(true)
      const timer = setTimeout(() => setJustSynced(false), SYNCED_MESSAGE_DURATION_MS)
      return () => clearTimeout(timer)
    }
  }, [pendingAge])

  if (!showProgress && !justSynced) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 ms-2"
    >
      {showProgress ? (
        <>
          <Spinner size="sm" />
          <span className="text-xs text-foreground">{t('checkout.syncProgress.syncing')}</span>
        </>
      ) : (
        <span className="text-xs text-foreground">{t('checkout.syncProgress.synced')}</span>
      )}
    </div>
  )
}
