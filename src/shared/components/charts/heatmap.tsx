'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'
import { seqColorFor, seqColor } from './palette'

export interface HeatCell {
  dayOfWeek: number // 0 = Sunday … 6 = Saturday
  hour: number // 0–23
  saleCount: number
  netSales: number
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Hourly sales heatmap (day-of-week × hour). Magnitude is encoded on a single-hue
 * sequential terracotta ramp — zero recedes to the surface, non-zero cells get at
 * least the first visible band so they never disappear. Per-cell hover tooltip;
 * a compact scale legend keys the ramp. Colors it by sale count by default.
 */
export function Heatmap({
  cells,
  metric = 'count',
  formatMoney,
  className,
}: {
  cells: HeatCell[]
  metric?: 'count' | 'net'
  formatMoney: (cents: number) => string
  className?: string
}) {
  const [hover, setHover] = React.useState<{ d: number; h: number } | null>(null)

  // Index cells for O(1) lookup, day 0–6 × hour 0–23.
  const grid = React.useMemo(() => {
    const g = new Map<string, HeatCell>()
    for (const c of cells) g.set(`${c.dayOfWeek}-${c.hour}`, c)
    return g
  }, [cells])

  const valueOf = (c: HeatCell | undefined) => (c ? (metric === 'net' ? c.netSales : c.saleCount) : 0)
  const max = Math.max(1, ...cells.map((c) => valueOf(c)))

  const hovered = hover ? grid.get(`${hover.d}-${hover.h}`) : undefined
  const hourTicks = [0, 3, 6, 9, 12, 15, 18, 21]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Hour axis */}
          <div className="mb-1 grid grid-cols-[2.5rem_repeat(24,1fr)] items-center gap-[2px] pl-0">
            <span />
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} className="text-center text-[10px] text-[color:var(--chart-axis-ink)]">
                {hourTicks.includes(h) ? h : ''}
              </span>
            ))}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((label, d) => (
            <div key={d} className="mb-[2px] grid grid-cols-[2.5rem_repeat(24,1fr)] items-center gap-[2px]">
              <span className="pr-1 text-right text-[11px] text-foreground-muted">{label}</span>
              {Array.from({ length: 24 }, (_, h) => {
                const c = grid.get(`${d}-${h}`)
                const v = valueOf(c)
                const active = hover?.d === d && hover?.h === h
                return (
                  <div
                    key={h}
                    className="aspect-square rounded-[2px]"
                    style={{
                      backgroundColor: v > 0 ? seqColorFor(v, max) : 'var(--border)',
                      opacity: v > 0 ? 1 : 0.4,
                      outline: active ? '2px solid var(--foreground)' : undefined,
                      outlineOffset: active ? '-1px' : undefined,
                    }}
                    onMouseEnter={() => setHover({ d, h })}
                    onMouseLeave={() => setHover(null)}
                    title={`${label} ${h}:00 — ${c?.saleCount ?? 0} sales`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {hovered && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 rounded-[var(--radius-input)] border border-border bg-surface px-2.5 py-1.5 text-caption shadow-[var(--shadow-md)]">
            <p className="font-semibold text-foreground">
              {DAY_LABELS[hovered.dayOfWeek]} {hovered.hour}:00–{hovered.hour + 1}:00
            </p>
            <p className="text-foreground-muted">
              {hovered.saleCount} {hovered.saleCount === 1 ? 'sale' : 'sales'} · {formatMoney(hovered.netSales)} net
            </p>
          </div>
        )}
      </div>

      {/* Scale legend */}
      <div className="flex items-center gap-2 text-caption text-foreground-muted">
        <span>Less</span>
        <div className="flex gap-[2px]">
          {[0, 1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className="h-3 w-4 rounded-[2px]"
              style={{ backgroundColor: step === 0 ? 'var(--border)' : seqColor(step), opacity: step === 0 ? 0.4 : 1 }}
            />
          ))}
        </div>
        <span>More</span>
        <span className="ml-2">{metric === 'net' ? 'by net sales' : 'by sale count'}</span>
      </div>
    </div>
  )
}
