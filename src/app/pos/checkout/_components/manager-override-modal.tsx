'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@shared/components/ui/dialog'
import { useTranslations } from '@shared/i18n'

interface ManagerOverrideModalProps {
  reason: string
  onClose: () => void
  onApprove: () => void
}

export function ManagerOverrideModal({
  reason,
  onClose,
  onApprove,
}: ManagerOverrideModalProps) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Call server action to verify manager override
      // This will be added in the next phase when we build the domain service
      onApprove()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('checkout.managerOverride.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 space-y-4" data-scan-exempt>
        <DialogTitle className="text-xl font-semibold text-foreground">{t('checkout.managerOverride.title')}</DialogTitle>

        <DialogDescription className="text-sm text-foreground">
          {t('checkout.managerOverride.description')}
        </DialogDescription>

        <div className="space-y-3">
          <div>
            <label htmlFor="manager-override-email" className="block text-sm font-semibold text-foreground mb-1">
              {t('checkout.managerOverride.emailLabel')}
            </label>
            <input
              id="manager-override-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('checkout.managerOverride.emailPlaceholder')}
              className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="manager-override-pin" className="block text-sm font-semibold text-foreground mb-1">
              {t('checkout.managerOverride.pinLabel')}
            </label>
            <input
              id="manager-override-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-danger/10 border border-danger text-foreground px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-border rounded-[var(--radius-input)] text-foreground hover:bg-background disabled:opacity-50 font-semibold"
          >
            {t('checkout.managerOverride.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !email || !pin}
            className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-[var(--radius-input)] hover:bg-accent-strong disabled:opacity-50 font-semibold"
          >
            {loading ? t('checkout.managerOverride.verifying') : t('checkout.managerOverride.approve')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
