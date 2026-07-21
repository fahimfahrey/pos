'use client'

import type { ScanFeedbackResult } from '../_lib/use-scan-feedback'

interface ScanFeedbackBannerProps {
  feedback: ScanFeedbackResult
}

const iconMap = {
  success: '✓',
  duplicate: '⚠',
  'not-found': '✕',
  idle: '',
}

const classNameMap = {
  success:
    'bg-success/10 border-success text-foreground',
  duplicate:
    'bg-warning/10 border-warning text-foreground',
  'not-found':
    'bg-danger/10 border-danger text-foreground',
  idle: 'opacity-0',
}

export function ScanFeedbackBanner({ feedback }: ScanFeedbackBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={
        feedback.state === 'idle'
          ? ''
          : `${feedback.state}: ${feedback.itemName || feedback.barcode || ''}`
      }
      className={`
        border-t border-b border-border px-4 py-3 transition-all duration-[var(--duration-fast)]
        ${classNameMap[feedback.state]}
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-2xl font-bold"
          aria-hidden="true"
        >
          {iconMap[feedback.state]}
        </span>
        <div className="flex-1">
          {feedback.state === 'success' && (
            <p className="font-semibold">
              ✓ {feedback.itemName}
            </p>
          )}
          {feedback.state === 'duplicate' && (
            <p className="font-semibold">
              Already scanned: {feedback.itemName}
            </p>
          )}
          {feedback.state === 'not-found' && (
            <div>
              <p className="font-semibold">Item not found</p>
              <p className="text-sm">Barcode: {feedback.barcode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
