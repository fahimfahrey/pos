'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

export interface BarDatum {
  key: string
  label: string
  value: number
  /** Pre-formatted value shown as the direct end label (e.g. "$1,234.56"). */
  display: string
  /** Optional secondary line in the hover tooltip (e.g. "42 sales"). */
  sub?: string
}

/**
 * Horizontal ranked bar chart for category / product / cashier breakdowns.
 * Length encodes magnitude, so color is a single constant hue (identity is the
 * row label, not the bar's rank — a filter that drops rows never repaints the
 * survivors). Bars are thin, anchored to the baseline, 4px-rounded at the data
 * end, with a selective direct label at the end of each bar. Per-mark hover
 * tooltip by default.
 */
export function BarChart({
  data,
  color = 'var(--chart-1)',
  className,
  maxBars = 12,
}: {
  data: BarDatum[]
  color?: string
  className?: string
  maxBars?: number
}) {
  const [hover, setHover] = React.useState<string | null>(null)

  // Rank, then fold the tail into a single "Other" bar so we never cycle hues or
  // overflow the plot.
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const head = sorted.slice(0, maxBars)
  const tail = sorted.slice(maxBars)
  const rows: BarDatum[] = [...head]
  if (tail.length > 0) {
    const sum = tail.reduce((s, d) => s + d.value, 0)
    rows.push({ key: '__other__', label: `Other (${tail.length})`, value: sum, display: '' })
  }

  const max = Math.max(1, ...rows.map((d) => d.value))

  return (
    <div className={cn('flex flex-col gap-2', className)} role="img" aria-label="Bar chart">
      {rows.map((d) => {
        const pct = Math.max(0, (d.value / max) * 100)
        const isOther = d.key === '__other__'
        const active = hover === d.key
        return (
          <div
            key={d.key}
            className="grid grid-cols-[minmax(6rem,9rem)_1fr_auto] items-center gap-3"
            onMouseEnter={() => setHover(d.key)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="truncate text-label text-foreground" title={d.label}>
              {d.label}
            </span>
            <div className="relative h-4 rounded-[4px] bg-border/50" title={`${d.label}: ${d.display}`}>
              <div
                className="absolute inset-y-0 left-0 rounded-[4px] transition-[width] duration-[var(--motion-base)]"
                style={{
                  width: `${pct}%`,
                  minWidth: d.value > 0 ? '3px' : 0,
                  backgroundColor: isOther ? 'var(--chart-axis)' : color,
                  opacity: active ? 1 : 0.92,
                  boxShadow: active ? '0 0 0 2px var(--surface)' : undefined,
                }}
              />
              {active && d.sub && (
                <div className="pointer-events-none absolute -top-8 left-0 z-10 whitespace-nowrap rounded-[var(--radius-input)] border border-border bg-surface px-2 py-1 text-caption text-foreground shadow-[var(--shadow-md)]">
                  <span className="font-semibold">{d.display}</span> · {d.sub}
                </div>
              )}
            </div>
            <span className="w-20 text-right text-label tabular-nums text-foreground-muted">{d.display}</span>
          </div>
        )
      })}
    </div>
  )
}
