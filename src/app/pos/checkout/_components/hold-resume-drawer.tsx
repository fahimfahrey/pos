'use client'

import { useEffect, useState } from 'react'
import { createDefaultStorageProvider } from '@infra/storage'
import type { CartLine } from '@domains/sales/entities/cart-line'
import type { ParkedCart } from '@domains/sales/entities/parked-cart'
import { Sheet } from '@shared/components/ui/sheet'
import { formatMoney } from '../_lib/format-money'

interface HoldResumeDrawerProps {
  registerId: string
  onClose: () => void
  onResume: (lines: CartLine[]) => void
}

export function HoldResumeDrawer({
  registerId,
  onClose,
  onResume,
}: HoldResumeDrawerProps) {
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadParkedCarts = async () => {
      try {
        const provider = createDefaultStorageProvider()
        const repos = await provider.getRepositorySet()
        const carts = await repos.sales.listParkedCarts(registerId)
        setParkedCarts(carts || [])
      } catch (error) {
        console.error('Failed to load parked carts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadParkedCarts()
  }, [registerId])

  const handleDelete = async (cartId: string) => {
    try {
      const provider = createDefaultStorageProvider()
      const repos = await provider.getRepositorySet()
      await repos.sales.deleteParkedCart(cartId)
      setParkedCarts((prev) => prev.filter((c) => c.id !== cartId))
    } catch (error) {
      console.error('Failed to delete parked cart:', error)
    }
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        data-scan-exempt
      />

      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-surface border-l border-border shadow-lg flex flex-col"
        data-scan-exempt
      >
        <div className="border-b border-border px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Held Carts</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-foreground hover:text-foreground/80"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-foreground">
              Loading...
            </div>
          ) : parkedCarts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-foreground px-4">
              No held carts
            </div>
          ) : (
            <div className="divide-y divide-border">
              {parkedCarts.map((cart) => {
                const subtotal = cart.lines.reduce(
                  (sum, line) => sum + line.price * line.quantity,
                  0
                )
                return (
                  <div
                    key={cart.id}
                    className="p-4 hover:bg-background transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-foreground">
                          {cart.lines.length} items
                        </div>
                        <div className="text-sm text-foreground">
                          {new Date(cart.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="font-bold text-foreground tabular-nums">
                        {formatMoney(subtotal)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResume(cart.lines)
                          onClose()
                        }}
                        className="flex-1 px-3 py-2 bg-success text-white rounded-[var(--radius-input)] hover:bg-success/90 font-semibold text-sm"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => handleDelete(cart.id)}
                        className="flex-1 px-3 py-2 border border-danger text-danger rounded-[var(--radius-input)] hover:bg-danger/10 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  )
}
