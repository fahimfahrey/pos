'use client'

import { useState } from 'react'
import { formatMoney } from '../_lib/format-money'
import { ManagerOverrideModal } from './manager-override-modal'

interface LineDiscountPopoverProps {
  lineSubtotal: number
  currentDiscount: { type: 'percentage' | 'fixed'; amount: number } | null
  onApply: (discount: { type: 'percentage' | 'fixed'; amount: number }) => void
  onClose: () => void
}

export function LineDiscountPopover({
  lineSubtotal,
  currentDiscount,
  onApply,
  onClose,
}: LineDiscountPopoverProps) {
  const [type, setType] = useState<'percentage' | 'fixed'>(
    currentDiscount?.type || 'percentage'
  )
  const [amount, setAmount] = useState(
    currentDiscount?.amount ? String(currentDiscount.amount) : '0'
  )
  const [showOverride, setShowOverride] = useState(false)
  const [pendingDiscount, setPendingDiscount] = useState<
    { type: 'percentage' | 'fixed'; amount: number } | null
  >(null)

  const numAmount = parseFloat(amount) || 0
  const discountValue =
    type === 'percentage' ? (lineSubtotal * numAmount) / 100 : numAmount
  const maxDiscount = lineSubtotal * 0.5 // 50% max without override

  const handleApply = () => {
    if (numAmount === 0) {
      onClose()
      return
    }

    const discount = { type, amount: numAmount }

    if (discountValue > maxDiscount) {
      // Need manager override
      setPendingDiscount(discount)
      setShowOverride(true)
      return
    }

    onApply(discount)
    onClose()
  }

  return (
    <>
      <div
        className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-[var(--radius-card)] shadow-lg p-4 z-50 min-w-64"
        data-scan-exempt
      >
        <div className="space-y-3">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setType('percentage')}
              className={`flex-1 px-3 py-2 rounded-[var(--radius-input)] text-sm font-semibold transition-colors ${
                type === 'percentage'
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-border bg-background text-foreground hover:bg-surface'
              }`}
            >
              %
            </button>
            <button
              onClick={() => setType('fixed')}
              className={`flex-1 px-3 py-2 rounded-[var(--radius-input)] text-sm font-semibold transition-colors ${
                type === 'fixed'
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-border bg-background text-foreground hover:bg-surface'
              }`}
            >
              $
            </button>
          </div>

          {/* Amount input */}
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background text-center"
              data-scan-exempt
            />
            <span className="text-foreground font-semibold self-center">
              {type === 'percentage' ? '%' : '$'}
            </span>
          </div>

          {/* Preview */}
          {numAmount > 0 && (
            <div className="text-sm text-foreground bg-background rounded p-2">
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-semibold">-{formatMoney(discountValue * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>New total:</span>
                <span className="font-semibold">
                  {formatMoney((lineSubtotal - discountValue) * 100)}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground hover:bg-background transition-colors font-semibold"
              data-scan-exempt
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 bg-success text-white rounded-[var(--radius-input)] hover:bg-success/90 transition-colors font-semibold"
              data-scan-exempt
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {showOverride && pendingDiscount && (
        <ManagerOverrideModal
          reason="discount_exceeds_limit"
          onClose={() => {
            setShowOverride(false)
            setPendingDiscount(null)
          }}
          onApprove={() => {
            setShowOverride(false)
            onApply(pendingDiscount)
            onClose()
            setPendingDiscount(null)
          }}
        />
      )}
    </>
  )
}
