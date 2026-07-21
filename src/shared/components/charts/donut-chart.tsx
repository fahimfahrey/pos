'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'
import { seriesColor, formatPercent } from './palette'

export interface DonutDatum {
  key: string
  label: string
  value: number
  /** Pre-formatted amount (e.g. "$1,234.56"). */
  display: string
}

/**
 * Payment-mix donut. Segments take categorical hues in fixed order (identity is
 * the payment method, so color follows the entity), separated by a 2px surface
 * gap so adjacent wedges never blur. The center holds the total; a legend with
 * direct percentage labels sits beside it so identity is never color-alone.
 */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  className,
}: {
  data: DonutDatum[]
  centerLabel: string
  centerValue: string
  className?: string
}) {
  const [hover, setHover] = React.useState<string | null>(null)

  const total = data.reduce((s, d) => s + d.value, 0)
  const R = 70
  const CX = 90
  const CY = 90
  const C = 2 * Math.PI * R
  const GAP = total > 0 ? 2 : 0 // 2px surface gap between fills

  let acc = 0
  const segments = data
    .filter((d) => d.value > 0)
    .map((d, i) => {
      const frac = total > 0 ? d.value / total : 0
      const len = Math.max(0, frac * C - GAP)
      const offset = -acc * C
      acc += frac
      return { ...d, color: seriesColor(i), len, offset, frac }
    })

  return (
    <div className={cn('flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6', className)}>
      <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0" role="img" aria-label="Payment mix donut">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--chart-grid)" strokeWidth={22} />
        <g transform={`rotate(-90 ${CX} ${CY})`}>
          {segments.map((s) => {
            const active = hover === s.key
            return (
              <circle
                key={s.key}
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={active ? 26 : 22}
                strokeDasharray={`${s.len} ${C - s.len}`}
                strokeDashoffset={s.offset}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: 'stroke-width var(--motion-fast)' }}
              />
            )
          })}
        </g>
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={9} fill="var(--chart-axis-ink)">
          {centerLabel}
        </text>
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          fontSize={16}
          fontWeight={600}
          fill="var(--foreground)"
          className="tabular-nums"
        >
          {centerValue}
        </text>
      </svg>

      <ul className="flex w-full flex-col gap-1.5">
        {segments.map((s) => {
          const active = hover === s.key
          return (
            <li
              key={s.key}
              className={cn(
                'flex items-center gap-2 rounded-[var(--radius-input)] px-1.5 py-1 text-label transition-colors',
                active && 'bg-surface-muted',
              )}
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] ring-2 ring-surface"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate text-foreground">{s.label}</span>
              <span className="ml-auto shrink-0 pl-3 tabular-nums text-foreground-muted">
                {formatPercent(s.frac)}
              </span>
              <span className="w-24 shrink-0 text-right tabular-nums font-medium text-foreground">{s.display}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
