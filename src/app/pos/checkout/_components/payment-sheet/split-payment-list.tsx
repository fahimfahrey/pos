'use client'

import { Badge } from '@shared/components/ui/badge'
import { Button } from '@shared/components/ui/button'

interface Tender {
  id: string
  method: string
  amount: number
  status: 'draft' | 'charging' | 'pending' | 'captured' | 'failed'
  failureReason?: string
}

interface SplitPaymentListProps {
  tenders: Tender[]
  remainingDue: number
  onRemove?: (tenderId: string) => void
}

const formatMoney = (cents: number) => {
  const dollars = cents / 100
  return `$${dollars.toFixed(2)}`
}

const getBadgeVariant = (status: string) => {
  if (status === 'captured') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'pending') return 'warning'
  return 'secondary'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Pending',
    charging: 'Processing',
    pending: 'Checking',
    captured: 'Captured',
    failed: 'Failed',
  }
  return labels[status] || status
}

export function SplitPaymentList({
  tenders,
  remainingDue,
  onRemove,
}: SplitPaymentListProps) {
  const removableTenders = tenders.filter((t) => t.status === 'draft')

  return (
    <div className="space-y-3">
      {tenders.map((tender) => (
        <div
          key={tender.id}
          className="flex items-center justify-between p-3 bg-surface border border-border rounded-[var(--radius-input)]"
        >
          <div className="flex-1">
            <div className="font-semibold text-foreground capitalize">{tender.method}</div>
            <div className="text-sm text-foreground tabular-nums">
              {formatMoney(tender.amount)}
            </div>
          </div>

          <Badge variant={getBadgeVariant(tender.status)}>
            {getStatusLabel(tender.status)}
          </Badge>

          {removableTenders.includes(tender) && onRemove && (
            <Button
              onClick={() => onRemove(tender.id)}
              variant="ghost"
              size="sm"
              className="ml-2"
              aria-label={`Remove ${tender.method} tender`}
            >
              ✕
            </Button>
          )}
        </div>
      ))}

      {remainingDue > 0 && (
        <div className="p-3 bg-background rounded-[var(--radius-input)] border border-border">
          <div className="text-sm text-foreground">Remaining Due</div>
          <div className="font-bold text-foreground tabular-nums font-display text-lg">
            {formatMoney(remainingDue)}
          </div>
        </div>
      )}
    </div>
  )
}
