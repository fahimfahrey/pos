'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

export interface CsvPayload {
  filename: string
  /** Fully-built CSV text (produced server-side by the reporting csv-export service). */
  content: string
}

/**
 * Downloads the report's underlying figures as CSV. Every chart pairs with a CSV
 * export (task requirement) — the content is built on the server from the same
 * rows the chart plots, so the export and the picture never disagree.
 */
export function CsvExportButton({ payload, className }: { payload: CsvPayload; className?: string }) {
  const onClick = React.useCallback(() => {
    // Prefix with a UTF-8 BOM so Excel opens accented names correctly.
    const blob = new Blob(['﻿' + payload.content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = payload.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [payload])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-border bg-surface px-2.5 py-1 text-caption font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2',
        className,
      )}
    >
      <span aria-hidden>↓</span>
      Export CSV
    </button>
  )
}
