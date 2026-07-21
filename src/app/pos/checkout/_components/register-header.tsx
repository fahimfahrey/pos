'use client'

import { useEffect, useState } from 'react'
import { Button } from '@shared/components/ui/button'
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
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-foreground">
            {registerName} #{registerNumber}
          </div>
          <div className="text-xs text-foreground">
            {cashierName}
          </div>
        </div>

        <div className="text-xs text-foreground">
          Shift: {elapsedTime}
        </div>
      </div>

      <div className="flex items-center gap-4">
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

        <div
          className={`text-xs font-semibold px-2 py-1 rounded ${
            isOnline
              ? 'bg-success/10 border border-success text-foreground'
              : 'bg-danger/10 border border-danger text-foreground'
          }`}
        >
          {isOnline ? '● Online' : '● Offline'}
        </div>
      </div>
    </header>
  )
}
