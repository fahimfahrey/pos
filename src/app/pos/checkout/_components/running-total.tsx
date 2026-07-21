'use client'

import { formatMoney } from '../_lib/format-money'

interface RunningTotalProps {
  subtotal: number
  tax: number
  total: number
}

export function RunningTotal({ subtotal, tax, total }: RunningTotalProps) {
  return (
    <div className="w-full bg-foreground text-surface px-4 py-5 border-t border-b border-border">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-body">
          <span>Subtotal:</span>
          <span className="font-mono tabular-nums">
            {formatMoney(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm font-body">
          <span>Tax:</span>
          <span className="font-mono tabular-nums">
            {formatMoney(tax)}
          </span>
        </div>

        <div className="text-6xl font-display font-bold text-surface tabular-nums mt-2">
          {formatMoney(total)}
        </div>
      </div>
    </div>
  )
}
