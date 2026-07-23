'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground',
        success: 'bg-success text-[var(--on-success)]',
        danger: 'bg-danger text-[var(--on-danger)]',
        warning: 'bg-warning text-[var(--on-warning)]',
        secondary: 'bg-surface border border-border text-foreground',
      },
      shape: {
        badge: 'rounded-[var(--radius-button)] px-3 py-1 text-xs',
        pill: 'rounded-full px-4 py-1.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      shape: 'badge',
    },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, shape, ...props }, ref) => (
  <div ref={ref} className={cn(badgeVariants({ variant, shape, className }))} {...props} />
))

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
