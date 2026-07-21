'use client'

import { useState } from 'react'
import { Dialog } from '@shared/components/ui/dialog'

interface VoidSaleModalProps {
  onClose: () => void
  onConfirm: () => void
}

const VOID_REASONS = [
  'Customer changed mind',
  'Duplicate order',
  'Wrong item scanned',
  'Technical error',
  'Other',
]

export function VoidSaleModal({ onClose, onConfirm }: VoidSaleModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherReason, setOtherReason] = useState('')

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        data-scan-exempt
      >
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 max-w-md w-full mx-4 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Void Sale</h2>

          <p className="text-sm text-foreground">
            Please select a reason for voiding this sale:
          </p>

          <div className="space-y-2">
            {VOID_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => {
                  setSelectedReason(reason)
                  if (reason !== 'Other') {
                    setOtherReason('')
                  }
                }}
                className={`w-full px-4 py-3 rounded-[var(--radius-input)] text-left font-semibold transition-colors ${
                  selectedReason === reason
                    ? 'bg-danger text-white'
                    : 'border border-border bg-background text-foreground hover:bg-surface'
                }`}
                data-scan-exempt
              >
                {reason}
              </button>
            ))}
          </div>

          {selectedReason === 'Other' && (
            <div>
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Explain reason..."
                className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background"
                data-scan-exempt
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-[var(--radius-input)] text-foreground hover:bg-background font-semibold"
              data-scan-exempt
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedReason}
              className="flex-1 px-4 py-2 bg-danger text-white rounded-[var(--radius-input)] hover:bg-danger/90 disabled:opacity-50 font-semibold"
              data-scan-exempt
            >
              Void Sale
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
