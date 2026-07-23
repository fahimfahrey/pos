'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations, useFormatters } from '@shared/i18n'
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
  const amountInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations()
  const { money } = useFormatters()

  useEffect(() => {
    amountInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
        role="dialog"
        aria-label={t('checkout.lineDiscount.dialogAria')}
        className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-[var(--radius-card)] shadow-lg p-4 z-50 min-w-64"
        data-scan-exempt
      >
        <div className="space-y-3">
          {/* Type toggle */}
          <div className="flex gap-2" role="group" aria-label={t('checkout.lineDiscount.typeGroupAria')}>
            <button
              type="button"
              aria-pressed={type === 'percentage'}
              onClick={() => setType('percentage')}
              className={`flex-1 px-3 py-2 rounded-[var(--radius-input)] text-sm font-semibold transition-colors ${
                type === 'percentage'
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-border bg-background text-foreground hover:bg-surface'
              }`}
            >
              <span aria-hidden="true">%</span>
              <span className="sr-only">{t('checkout.lineDiscount.percentage')}</span>
            </button>
            <button
              type="button"
              aria-pressed={type === 'fixed'}
              onClick={() => setType('fixed')}
              className={`flex-1 px-3 py-2 rounded-[var(--radius-input)] text-sm font-semibold transition-colors ${
                type === 'fixed'
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-border bg-background text-foreground hover:bg-surface'
              }`}
            >
              <span aria-hidden="true">$</span>
              <span className="sr-only">{t('checkout.lineDiscount.fixedAmount')}</span>
            </button>
          </div>

          {/* Amount input */}
          <div className="flex gap-2">
            <label htmlFor="line-discount-amount" className="sr-only">
              {t('checkout.lineDiscount.amountLabel')}
            </label>
            <input
              id="line-discount-amount"
              ref={amountInputRef}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background text-center"
            />
            <span aria-hidden="true" className="text-foreground font-semibold self-center">
              {type === 'percentage' ? '%' : '$'}
            </span>
          </div>

          {/* Preview */}
          {numAmount > 0 && (
            <div className="text-sm text-foreground bg-background rounded p-2">
              <div className="flex justify-between">
                <span>{t('checkout.lineDiscount.discountLabel')}</span>
                <span className="font-semibold">-{money(discountValue * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('checkout.lineDiscount.newTotalLabel')}</span>
                <span className="font-semibold">
                  {money((lineSubtotal - discountValue) * 100)}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground hover:bg-background transition-colors font-semibold"
            >
              {t('checkout.lineDiscount.cancel')}
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 bg-success text-[var(--on-success)] rounded-[var(--radius-input)] hover:bg-success/90 transition-colors font-semibold"
            >
              {t('checkout.lineDiscount.apply')}
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
