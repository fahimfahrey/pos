'use client'

import { useState } from 'react'
import type { Register } from '@domains/organization/entities/register'
import { useTranslations } from '@shared/i18n'

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
  const t = useTranslations()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const amount = parseFloat(floatAmount) * 100
      await onShiftOpened(Math.round(amount))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('checkout.openShift.genericError'))
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
            {t('checkout.openShift.welcome', { name: cashierName })}
          </p>
        </div>

        <div className="space-y-3">
          <label htmlFor="open-shift-float" className="block text-sm font-semibold text-foreground">
            {t('checkout.openShift.floatLabel')}
          </label>
          <div className="flex gap-2 items-center">
            <span aria-hidden="true" className="text-foreground font-semibold">$</span>
            <input
              id="open-shift-float"
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
            {t('checkout.openShift.floatHelp')}
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-danger/10 border border-danger text-foreground px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !floatAmount}
          className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-[var(--radius-button)] hover:bg-accent-strong disabled:opacity-50 font-bold h-14 text-lg"
          data-scan-exempt
        >
          {loading ? t('checkout.openShift.openingShift') : t('checkout.openShift.openShift')}
        </button>
      </div>
    </div>
  )
}
