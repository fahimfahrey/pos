'use client'

import { useState } from 'react'
import { Dialog } from '@shared/components/ui/dialog'

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

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Call server action to verify manager override
      // This will be added in the next phase when we build the domain service
      onApprove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Override failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" data-scan-exempt>
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 max-w-md w-full mx-4 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Manager Override</h2>

          <p className="text-sm text-foreground">
            This action requires manager approval. Please enter your manager credentials.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Manager Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@store.com"
                className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background"
                disabled={loading}
                data-scan-exempt
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Manager PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] text-foreground bg-background"
                disabled={loading}
                data-scan-exempt
              />
            </div>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger text-foreground px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-border rounded-[var(--radius-input)] text-foreground hover:bg-background disabled:opacity-50 font-semibold"
              data-scan-exempt
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !email || !pin}
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-[var(--radius-input)] hover:bg-accent-strong disabled:opacity-50 font-semibold"
              data-scan-exempt
            >
              {loading ? 'Verifying...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
