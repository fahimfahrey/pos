'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

export interface FigureColumn<Row> {
  key: string
  header: string
  /** Right-align numeric columns; they also get tabular-nums for vertical alignment. */
  align?: 'left' | 'right'
  render: (row: Row) => React.ReactNode
}

/**
 * The underlying figures every chart pairs with. It IS the relief for the
 * low-contrast categorical slots and the accessible fallback for CVD/screen
 * readers, so it carries the exact numbers behind the picture. A leading swatch
 * column ties each row back to its series color without relying on color alone
 * (the label is always present too).
 */
export function FigureTable<Row>({
  rows,
  columns,
  rowKey,
  swatch,
  caption,
  className,
}: {
  rows: Row[]
  columns: FigureColumn<Row>[]
  rowKey: (row: Row, i: number) => string
  /** Optional per-row series color, rendered as a leading swatch. */
  swatch?: (row: Row, i: number) => string | undefined
  caption?: string
  className?: string
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-label">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border">
            {swatch && <th className="w-6 px-1 py-1.5" aria-hidden />}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-2 py-1.5 font-semibold text-foreground-muted',
                  col.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)} className="border-b border-border/60 last:border-0">
              {swatch && (
                <td className="px-1 py-1.5">
                  {swatch(row, i) && (
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-[3px] ring-2 ring-surface"
                      style={{ backgroundColor: swatch(row, i) }}
                    />
                  )}
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-2 py-1.5 text-foreground',
                    col.align === 'right' ? 'text-right tabular-nums' : 'text-left',
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
