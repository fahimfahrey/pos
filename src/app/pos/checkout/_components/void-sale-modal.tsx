'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@shared/components/ui/dialog'
import { useTranslations } from '@shared/i18n'

interface VoidSaleModalProps {
  onClose: () => void
  onConfirm: () => void
}

const VOID_REASON_IDS = [
  'customer_changed_mind',
  'duplicate_order',
  'wrong_item',
  'technical_error',
  'other',
] as const

export function VoidSaleModal({ onClose, onConfirm }: VoidSaleModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherReason, setOtherReason] = useState('')
  const t = useTranslations()

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 space-y-4" data-scan-exempt>
        <DialogTitle className="text-xl font-semibold text-foreground">{t('checkout.voidSale.title')}</DialogTitle>

        <DialogDescription className="text-sm text-foreground">
          {t('checkout.voidSale.description')}
        </DialogDescription>

        <div role="radiogroup" aria-label={t('checkout.voidSale.reasonGroupAria')} className="space-y-2">
          {VOID_REASON_IDS.map((reasonId) => (
            <button
              key={reasonId}
              type="button"
              role="radio"
              aria-checked={selectedReason === reasonId}
              onClick={() => {
                setSelectedReason(reasonId)
                if (reasonId !== 'other') {
                  setOtherReason('')
                }
              }}
              className={`w-full px-4 py-3 rounded-[var(--radius-input)] text-left font-semibold transition-colors ${
                selectedReason === reasonId
                  ? 'bg-danger text-[var(--on-danger)]'
                  : 'border border-border bg-background text-foreground hover:bg-surface'
              }`}
            >
              {t(`checkout.voidSale.reasons.${reasonId}`)}
            </button>
          ))}
        </div>

        {selectedReason === 'other' && (
          <div>
            <label htmlFor="void-other-reason" className="sr-only">
              {t('checkout.voidSale.otherReasonAria')}
            </label>
            <input
              id="void-other-reason"
              type="text"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder={t('checkout.voidSale.otherReasonPlaceholder')}
              className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-[var(--radius-input)] text-foreground hover:bg-background font-semibold"
          >
            {t('checkout.voidSale.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason}
            className="flex-1 px-4 py-2 bg-danger text-[var(--on-danger)] rounded-[var(--radius-input)] hover:bg-danger/90 disabled:opacity-50 font-semibold"
          >
            {t('checkout.voidSale.confirm')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
