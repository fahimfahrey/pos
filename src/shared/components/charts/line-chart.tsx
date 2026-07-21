'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

export interface LineSeries {
  key: string
  label: string
  color: string
  /** One value per category, same length/order as `categories`. */
  points: number[]
}

/**
 * Sales-trend line chart over time. One shared y-axis (never dual-axis) — every
 * series is the same measure (money) at the same scale. 2px lines, an optional
 * area fill under the primary series, recessive gridlines, and a crosshair +
 * tooltip on hover reading every series at the hovered period.
 */
export function LineChart({
  categories,
  series,
  formatValue,
  formatTick,
  area = true,
  className,
  height = 240,
}: {
  categories: string[]
  series: LineSeries[]
  formatValue: (n: number) => string
  formatTick: (n: number) => string
  area?: boolean
  className?: string
  height?: number
}) {
  const W = 760
  const H = height
  const PAD = { top: 12, right: 16, bottom: 26, left: 52 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const n = categories.length
  const allValues = series.flatMap((s) => s.points)
  const max = Math.max(1, ...allValues)
  const niceMax = niceCeil(max)

  const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const y = (v: number) => PAD.top + plotH - (v / niceMax) * plotH

  const ticks = [0, niceMax / 2, niceMax]
  const labelIdx = tickIndexes(n)

  const [hover, setHover] = React.useState<number | null>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = ((e.clientX - rect.left) / rect.width) * W
    if (n <= 1) return setHover(0)
    const i = Math.round(((relX - PAD.left) / plotW) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        role="img"
        aria-label="Line chart of sales over time"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Gridlines + y ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text
              x={PAD.left - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill="var(--chart-axis-ink)"
            >
              {formatTick(t)}
            </text>
          </g>
        ))}

        {/* Area under primary series */}
        {area && n > 1 && series[0] && (
          <path
            d={areaPath(series[0].points, x, y, PAD.top + plotH)}
            fill={series[0].color}
            opacity={0.1}
          />
        )}

        {/* Lines */}
        {series.map((s) =>
          n > 1 ? (
            <path
              key={s.key}
              d={linePath(s.points, x, y)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : (
            <circle key={s.key} cx={x(0)} cy={y(s.points[0] ?? 0)} r={4} fill={s.color} />
          ),
        )}

        {/* X labels */}
        {labelIdx.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            fontSize={11}
            fill="var(--chart-axis-ink)"
          >
            {categories[i]}
          </text>
        ))}

        {/* Crosshair + markers */}
        {hover !== null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--chart-axis)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {series.map((s) => (
              <circle
                key={s.key}
                cx={x(hover)}
                cy={y(s.points[hover] ?? 0)}
                r={4.5}
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            ))}
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 max-w-[14rem] -translate-x-1/2 rounded-[var(--radius-input)] border border-border bg-surface px-2.5 py-1.5 text-caption shadow-[var(--shadow-md)]"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="mb-1 font-semibold text-foreground">{categories[hover]}</p>
          <ul className="flex flex-col gap-0.5">
            {series.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5 text-foreground-muted">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-[2px] ring-2 ring-surface"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.label}</span>
                <span className="ml-auto pl-3 font-medium tabular-nums text-foreground">
                  {formatValue(s.points[hover] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function linePath(points: number[], x: (i: number) => number, y: (v: number) => number): string {
  return points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
}

function areaPath(points: number[], x: (i: number) => number, y: (v: number) => number, baseY: number): string {
  if (points.length === 0) return ''
  const top = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
  return `${top} L ${x(points.length - 1)} ${baseY} L ${x(0)} ${baseY} Z`
}

function niceCeil(v: number): number {
  if (v <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

/** Choose up to 5 evenly-spaced x-label indexes so ticks never crowd. */
function tickIndexes(n: number): number[] {
  if (n <= 1) return [0]
  if (n <= 5) return Array.from({ length: n }, (_, i) => i)
  const count = 5
  return Array.from({ length: count }, (_, k) => Math.round((k / (count - 1)) * (n - 1)))
}
