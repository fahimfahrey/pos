'use client'

import { useState } from 'react'
import { Dialog } from '@shared/components/ui/dialog'
import { formatMoney } from '../_lib/format-money'

interface PaymentPanelProps {
  total: number
  onClose: () => void
  onFinalize: (paymentMethod: string, amount: number) => void
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'check', label: 'Check' },
  { id: 'store_credit', label: 'Store Credit' },
  { id: 'other', label: 'Other' },
]

export function PaymentPanel({ total, onClose, onFinalize }: PaymentPanelProps) {
  const [method, setMethod] = useState('card')
  const [amount, setAmount] = useState(String(total / 100))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const numAmount = parseFloat(amount) * 100
      await onFinalize(method, Math.round(numAmount))
    } finally {
      setLoading(false)
    }
  }

  const numAmount = parseFloat(amount) || 0
  const change = numAmount - total / 100

  return (
    <Dialog open onOpenChange={onClose}>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        data-scan-exempt
      >
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 max-w-lg w-full mx-4 space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Payment</h2>

          <div className="bg-background rounded p-4">
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total Due:</span>
              <span className="font-display tabular-nums">
                {formatMoney(total)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`px-3 py-2 rounded-[var(--radius-input)] font-semibold transition-colors ${
                    method === m.id
                      ? 'bg-accent text-accent-foreground'
                      : 'border border-border bg-background text-foreground hover:bg-surface'
                  }`}
                  disabled={loading}
                  data-scan-exempt
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Amount Tendered
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              className="w-full px-3 py-3 border border-border rounded-[var(--radius-input)] text-foreground bg-background text-lg font-semibold"
              disabled={loading}
              data-scan-exempt
            />
          </div>

          {change >= 0 && (
            <div className="bg-background rounded p-3 text-center">
              <div className="text-sm text-foreground mb-1">Change</div>
              <div className="text-2xl font-bold text-foreground font-display tabular-nums">
                {formatMoney(Math.round(change * 100))}
              </div>
            </div>
          )}

          {change < 0 && (
            <div className="bg-danger/10 border border-danger text-foreground px-3 py-2 rounded text-center font-semibold">
              Short by {formatMoney(Math.round(Math.abs(change) * 100))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-border rounded-[var(--radius-button)] text-foreground hover:bg-background disabled:opacity-50 font-semibold h-14"
              data-scan-exempt
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || change < 0}
              className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-[var(--radius-button)] hover:bg-accent-strong disabled:opacity-50 font-bold h-14 text-lg"
              data-scan-exempt
            >
              {loading ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
