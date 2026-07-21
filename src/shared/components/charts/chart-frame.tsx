'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'
import { Legend, type LegendItem } from './legend'
import { CsvExportButton, type CsvPayload } from './csv-export-button'

/**
 * The card every report chart lives in — one consistent frame so the set reads as
 * a single system. It owns the title/subtitle, the legend (≥ 2 series), the CSV
 * export, and the "Show figures" disclosure that reveals the paired figure table.
 * The chart body is passed as children; the figures node is passed separately so
 * it can be collapsed by default without unmounting focus targets.
 */
export function ChartFrame({
  title,
  subtitle,
  legend,
  csv,
  figures,
  figuresLabel = 'figures',
  children,
  className,
  defaultShowFigures = false,
}: {
  title: string
  subtitle?: string
  legend?: LegendItem[]
  csv?: CsvPayload
  /** The paired underlying-figures table (usually a <FigureTable/>). */
  figures?: React.ReactNode
  figuresLabel?: string
  children: React.ReactNode
  className?: string
  defaultShowFigures?: boolean
}) {
  const [showFigures, setShowFigures] = React.useState(defaultShowFigures)

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 shadow-[var(--shadow-sm)] print-avoid-break',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-body font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-caption text-foreground-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {figures && (
            <button
              type="button"
              onClick={() => setShowFigures((v) => !v)}
              aria-expanded={showFigures}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-border bg-surface px-2.5 py-1 text-caption font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {showFigures ? 'Hide' : 'Show'} {figuresLabel}
            </button>
          )}
          {csv && <CsvExportButton payload={csv} />}
        </div>
      </header>

      {legend && legend.length >= 2 && <Legend items={legend} />}

      <div>{children}</div>

      {figures && showFigures && <div className="border-t border-border pt-3">{figures}</div>}
    </section>
  )
}
