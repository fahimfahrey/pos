'use client'

import type { CartLine } from '@domains/sales/entities/cart-line'
import { CartRow } from './cart-row'

interface CartListProps {
  lines: CartLine[]
  onQtyChange: (index: number, qty: number) => void
  onRemove: (index: number) => void
  onDiscountChange: (
    index: number,
    discount: { type: 'percentage' | 'fixed'; amount: number }
  ) => void
}

export function CartList({
  lines,
  onQtyChange,
  onRemove,
  onDiscountChange,
}: CartListProps) {
  return (
    <div className="flex-1 overflow-y-auto border-b border-border">
      <div className="divide-y divide-border">
        {lines.map((line, index) => (
          <CartRow
            key={`${line.variantId}-${index}`}
            index={index}
            line={line}
            onQtyChange={onQtyChange}
            onRemove={onRemove}
            onDiscountChange={onDiscountChange}
          />
        ))}
      </div>
    </div>
  )
}
