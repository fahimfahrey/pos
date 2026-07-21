'use client'

import { useEffect, useState } from 'react'
import { Button } from '@shared/components/ui/button'
import { OfflineBanner } from '@shared/components/ui/offline-banner'
import { useSoundSettings } from '../_lib/use-sound-settings'
import { useOutboxCount } from '../_lib/register-outbox'

interface RegisterHeaderProps {
  registerName: string
  registerNumber: string
  cashierName: string
  shiftStartedAt: Date
  isOnline: boolean
}

export function RegisterHeader({
  registerName,
  registerNumber,
  cashierName,
  shiftStartedAt,
  isOnline,
}: RegisterHeaderProps) {
  const [elapsedTime, setElapsedTime] = useState<string>('')
  const outboxCount = useOutboxCount()
  const { muted, toggleMuted } = useSoundSettings()

  useEffect(() => {
    const updateElapsedTime = () => {
      const now = new Date()
      const elapsed = now.getTime() - shiftStartedAt.getTime()
      const hours = Math.floor(elapsed / (1000 * 60 * 60))
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))

      setElapsedTime(`${hours}h ${minutes}m`)
    }

    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [shiftStartedAt])

  return (
    <header className="min-h-14 short:min-h-10 bg-surface border-b border-border px-4 short:px-2 flex items-center justify-between pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-6 short:gap-3">
        <div className="flex flex-col gap-1 short:gap-0">
          <div className="font-semibold text-foreground">
            {registerName} #{registerNumber}
          </div>
          <div className="text-xs text-foreground short:hidden">
            {cashierName}
          </div>
        </div>

        <div className="text-xs text-foreground short:hidden">
          Shift: {elapsedTime}
        </div>
      </div>

      <div className="flex items-center gap-4 short:gap-2">
        {outboxCount > 0 && (
          <div key={outboxCount > 0 ? 'visible' : 'hidden'} className="text-xs bg-warning/10 border border-warning text-foreground rounded px-2 py-1 motion-pop-in">
            {outboxCount} pending
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          iconOnly
          onClick={toggleMuted}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        >
          {muted ? '🔇' : '🔊'}
        </Button>

        <OfflineBanner isOnline={isOnline} pendingCount={outboxCount} compact />
      </div>
    </header>
  )
}
