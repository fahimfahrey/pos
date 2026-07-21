'use client'

import { useState } from 'react'
import type { Register } from '@domains/organization/entities/register'

interface OpenShiftPanelProps {
  register: Register
  cashierName: string
  onShiftOpened: (floatAmount: number) => Promise<void>
}

export function OpenShiftPanel({
  register,
  cashierName,
  onShiftOpened,
}: OpenShiftPanelProps) {
  const [floatAmount, setFloatAmount] = useState('100.00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const amount = parseFloat(floatAmount) * 100
      await onShiftOpened(Math.round(amount))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open shift')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-8 max-w-md w-full space-y-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {register.name}
          </h1>
          <p className="text-foreground">
            Welcome, {cashierName}
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground">
            Opening Float Amount
          </label>
          <div className="flex gap-2 items-center">
            <span className="text-foreground font-semibold">$</span>
            <input
              type="number"
              value={floatAmount}
              onChange={(e) => setFloatAmount(e.target.value)}
              step="0.01"
              min="0"
              className="flex-1 px-3 py-3 border border-border rounded-[var(--radius-input)] text-foreground bg-background text-lg font-semibold"
              disabled={loading}
              data-scan-exempt
            />
          </div>
          <p className="text-xs text-foreground">
            This is your starting cash float for this shift
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger text-foreground px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !floatAmount}
          className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-[var(--radius-button)] hover:bg-accent-strong disabled:opacity-50 font-bold h-14 text-lg"
          data-scan-exempt
        >
          {loading ? 'Opening Shift...' : 'Open Shift'}
        </button>
      </div>
    </div>
  )
}
