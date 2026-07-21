'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, headingLevel = 'h2', ...props }, ref) => {
    const Heading = headingLevel

    return (
      <div ref={ref} className={cn('flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface p-8 text-center', className)} {...props}>
        {icon && <div className="text-4xl">{icon}</div>}
        <Heading className="text-display-lg font-display">{title}</Heading>
        {description && <p className="max-w-md text-body text-foreground-muted">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

export { EmptyState }
