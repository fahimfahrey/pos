'use client'

import * as React from 'react'
import { Button } from './button'
import { cn } from '@shared/utils/cn'

interface RouteErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode
  message: React.ReactNode
  kind: 'user' | 'system'
  retry?: () => void
  secondaryAction?: {
    label: React.ReactNode
    onClick: () => void
  }
  inline?: boolean
  showAlert?: boolean
}

const RouteError = React.forwardRef<HTMLDivElement, RouteErrorProps>(
  (
    {
      className,
      title,
      message,
      kind,
      retry,
      secondaryAction,
      inline = false,
      showAlert = true,
      ...props
    },
    ref
  ) => {
    const isSystem = kind === 'system'
    const isUser = kind === 'user'

    if (inline) {
      return (
        <div
          ref={ref}
          className={cn(
            'rounded-lg border p-4',
            isSystem && 'border-danger/30 bg-danger/5',
            isUser && 'border-warning/30 bg-warning/5',
            className
          )}
          role={showAlert ? 'alert' : undefined}
          aria-live={showAlert ? 'polite' : undefined}
          {...props}
        >
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-foreground-muted mb-3">{message}</p>
          <div className="flex gap-2">
            {isSystem && retry && (
              <Button size="sm" onClick={retry}>
                Try Again
              </Button>
            )}
            {secondaryAction && (
              <Button size="sm" variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('h-full w-full flex items-center justify-center bg-background', className)}
        role={showAlert ? 'alert' : undefined}
        aria-live={showAlert ? 'polite' : undefined}
        {...props}
      >
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">{isSystem ? '⚠' : '●'}</div>
          <h1 className="text-display-lg font-display text-foreground mb-2">{title}</h1>
          <p className="text-body text-foreground-muted mb-6">{message}</p>
          <div className="flex gap-2 justify-center">
            {isSystem && retry && (
              <Button onClick={retry}>
                Try Again
              </Button>
            )}
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }
)

RouteError.displayName = 'RouteError'

export { RouteError }
