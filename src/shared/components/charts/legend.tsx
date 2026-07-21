'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

export interface LegendItem {
  label: string
  /** CSS color (usually a `var(--chart-N)` reference). */
  color: string
}

/**
 * Legend for ≥ 2 series — always present so identity is never carried by color
 * alone. Swatches use a 2px surface ring so adjacent hues never blur together,
 * and each label is text-token ink (never the series color).
 */
export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  if (items.length < 2) return null
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)} aria-label="Legend">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-caption text-foreground-muted">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] ring-2 ring-surface"
            style={{ backgroundColor: item.color }}
          />
          <span className="truncate">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
