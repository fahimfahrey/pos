'use client'

import React from 'react'
import { cn } from '@shared/utils/cn'

interface StatCardProps {
  title: string
  value: React.ReactNode
  delta?: {
    label: string
    variant: 'positive' | 'negative' | 'neutral'
  }
  cta?: {
    label: string
    href: string
  }
  loading?: boolean
  className?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, delta, cta, loading, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-card)] border border-border bg-surface px-6 py-4 shadow-[var(--shadow-md)]',
          className
        )}
      >
        {/* Title (muted label) */}
        <p className="text-label text-foreground-muted mb-2">{title}</p>

        {/* Value (large tabular number) */}
        <p className="text-display-lg font-display font-semibold text-foreground tabular-nums mb-3">
          {loading ? <span className="bg-border h-8 w-32 inline-block rounded animate-pulse" /> : value}
        </p>

        {/* Delta badge and optional CTA */}
        {(delta || cta) && (
          <div className="flex items-center gap-3">
            {delta && (
              <div
                className={cn(
                  'text-caption px-2 py-1 rounded font-semibold',
                  delta.variant === 'positive' && 'bg-success text-white',
                  delta.variant === 'negative' && 'bg-danger text-white',
                  delta.variant === 'neutral' && 'bg-border text-foreground-muted'
                )}
              >
                {delta.label}
              </div>
            )}
            {cta && (
              <a
                href={cta.href}
                className="text-label text-accent hover:text-accent-strong transition-colors duration-[var(--motion-fast)]"
              >
                {cta.label}
              </a>
            )}
          </div>
        )}
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard }
export type { StatCardProps }
