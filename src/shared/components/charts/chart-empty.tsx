'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

/**
 * Designed empty state for a chart — shown when a report returns no rows for the
 * selected range/scope. Distinct from an error: the query succeeded, there is
 * simply nothing to plot. Every report ships one (acceptance requirement).
 */
export function ChartEmpty({
  title = 'No data for this range',
  hint = 'Try a wider date range or a different branch.',
  icon = '📊',
  className,
}: {
  title?: string
  hint?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border bg-surface/50 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="text-3xl opacity-70" aria-hidden>
        {icon}
      </div>
      <p className="text-body font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-label text-foreground-muted">{hint}</p>
    </div>
  )
}

/**
 * Insufficient-data state — there are rows, but too few to draw a meaningful
 * trend/heatmap (e.g. a single day of data behind a line chart). The underlying
 * figures are still shown; only the plotted form is suppressed.
 */
export function ChartInsufficient({
  message = 'Not enough data to chart yet — the figures are below.',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface/50 px-4 py-3 text-label text-foreground-muted',
        className,
      )}
    >
      <span aria-hidden>ⓘ</span>
      <span>{message}</span>
    </div>
  )
}
