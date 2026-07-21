'use client'

import { EmptyState } from '@shared/components/ui/empty-state'

export function EmptyCartState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        icon="🛒"
        title="Cart is empty"
        description="Start by scanning items or use F4 to resume a held cart"
      />
    </div>
  )
}
