'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

interface OfflineBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  isOnline: boolean
  pendingCount?: number
  compact?: boolean
}

const OfflineBanner = React.forwardRef<HTMLDivElement, OfflineBannerProps>(
  ({ className, isOnline, pendingCount = 0, compact = false, ...props }, ref) => {
    if (isOnline) {
      return null
    }

    const baseClasses = cn(
      'flex items-center gap-3 text-xs font-medium px-3 py-2 rounded-lg transition-colors',
      'border bg-surface',
      className
    )

    if (compact) {
      return (
        <div
          ref={ref}
          className={cn(baseClasses, 'border-danger/30 bg-danger/5 text-foreground')}
          role="status"
          aria-live="polite"
          {...props}
        >
          <span>● Offline</span>
          {pendingCount > 0 && <span className="ml-1">{pendingCount} pending</span>}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, 'flex-col gap-2 border-warning/30 bg-warning/5 text-foreground p-4 mb-4')}
        role="status"
        aria-live="polite"
        {...props}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">● Offline</span>
          {pendingCount > 0 && (
            <span className="ml-auto bg-warning/20 border border-warning/30 rounded-full px-3 py-1 text-xs font-medium">
              {pendingCount} pending
            </span>
          )}
        </div>
        <p className="text-sm text-foreground-muted">
          You're offline — sales and changes are saved on this device and will sync when you're back online.
        </p>
      </div>
    )
  }
)

OfflineBanner.displayName = 'OfflineBanner'

export { OfflineBanner }
