'use client'

import { useState } from 'react'
import type { CartLine } from '@domains/sales/entities/cart-line'
import { formatMoney } from '../_lib/format-money'
import { QtyStepper } from './qty-stepper'
import { LineDiscountPopover } from './line-discount-popover'

interface CartRowProps {
  index: number
  line: CartLine
  onQtyChange: (index: number, qty: number) => void
  onRemove: (index: number) => void
  onDiscountChange: (
    index: number,
    discount: { type: 'percentage' | 'fixed'; amount: number }
  ) => void
}

// Note: Register design direction requires no muted text (--foreground-muted is retired)
// All text uses full --foreground contrast for 15.9:1+ legibility. Secondary hierarchy
// via type scale/weight only.

export function CartRow({
  index,
  line,
  onQtyChange,
  onRemove,
  onDiscountChange,
}: CartRowProps) {
  const [showDiscount, setShowDiscount] = useState(false)
  const lineSubtotal = (line.price * line.quantity) / 100
  const lineTotal = line.discount
    ? lineSubtotal - (line.discount.type === 'percentage'
        ? (lineSubtotal * line.discount.amount) / 100
        : line.discount.amount / 100)
    : lineSubtotal

  return (
    <div className="min-h-16 short:min-h-12 py-2 short:py-1 px-3 hover:bg-warm-gray/50 transition-colors">
      <div className="flex gap-3 items-stretch">
        {/* Item name and details */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="font-semibold text-foreground truncate">
            {line.name}
          </div>
          <div className="text-sm text-foreground">
            {formatMoney(line.price)} ea
          </div>
        </div>

        {/* Qty stepper */}
        <QtyStepper
          value={line.quantity}
          onChange={(qty) => onQtyChange(index, qty)}
        />

        {/* Discount button */}
        <div className="relative">
          <button
            onClick={() => setShowDiscount(!showDiscount)}
            className="h-10 w-10 min-h-10 min-w-10 short:h-8 short:w-8 short:min-h-8 short:min-w-8 mouse:h-8 mouse:w-8 mouse:min-h-8 mouse:min-w-8 rounded-[var(--radius-input)] border border-border bg-surface text-foreground hover:bg-background transition-colors text-xs font-semibold"
            aria-label="Discount"
            data-scan-exempt
          >
            %
          </button>

          {showDiscount && (
            <LineDiscountPopover
              lineSubtotal={lineSubtotal}
              currentDiscount={line.discount}
              onApply={(discount) => {
                onDiscountChange(index, discount)
                setShowDiscount(false)
              }}
              onClose={() => setShowDiscount(false)}
            />
          )}
        </div>

        {/* Line total */}
        <div className="flex flex-col justify-center text-right min-w-24">
          <div className="font-bold text-foreground tabular-nums">
            {formatMoney(lineTotal * 100)}
          </div>
          {line.discount && (
            <div className="text-xs text-foreground">
              -{formatMoney(
                line.discount.type === 'percentage'
                  ? (lineSubtotal * line.discount.amount) / 100 * 100
                  : line.discount.amount
              )}
            </div>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(index)}
          className="h-10 w-10 min-h-10 min-w-10 short:h-8 short:w-8 short:min-h-8 short:min-w-8 mouse:h-8 mouse:w-8 mouse:min-h-8 mouse:min-w-8 rounded-[var(--radius-input)] border border-border bg-surface text-danger hover:bg-danger/10 transition-colors text-lg font-bold"
          aria-label="Remove item"
          data-scan-exempt
        >
          ✕
        </button>
      </div>
    </div>
  )
}
