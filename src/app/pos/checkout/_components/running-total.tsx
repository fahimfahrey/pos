'use client'

import { formatMoney } from '../_lib/format-money'

interface RunningTotalProps {
  subtotal: number
  tax: number
  total: number
}

export function RunningTotal({ subtotal, tax, total }: RunningTotalProps) {
  return (
    <div className="w-full bg-foreground text-surface px-4 py-5 short:py-2 border-t border-b border-border">
      <div className="flex flex-col gap-2 short:gap-0.5">
        <div className="flex justify-between text-sm font-body short:hidden">
          <span>Subtotal:</span>
          <span className="font-mono tabular-nums">
            {formatMoney(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm font-body short:hidden">
          <span>Tax:</span>
          <span className="font-mono tabular-nums">
            {formatMoney(tax)}
          </span>
        </div>

        <div className="text-6xl short:text-3xl font-display font-bold text-surface tabular-nums mt-2 short:mt-0">
          {formatMoney(total)}
        </div>
      </div>
    </div>
  )
}
