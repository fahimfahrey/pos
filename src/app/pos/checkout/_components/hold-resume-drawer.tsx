'use client'

import { useEffect, useState } from 'react'
import { createDefaultStorageProvider } from '@infra/storage'
import type { CartLine } from '@domains/sales/entities/cart-line'
import type { ParkedCart } from '@domains/sales/entities/parked-cart'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@shared/components/ui/sheet'
import { useFormatters, useTranslations } from '@shared/i18n'

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
  const t = useTranslations()
  const { date, number, money } = useFormatters()

  useEffect(() => {
    const loadParkedCarts = async () => {
      try {
        const provider = await createDefaultStorageProvider()
        const carts = await provider.withTransaction((repos) => repos.sales.listParkedCarts(registerId))
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
      const provider = await createDefaultStorageProvider()
      await provider.withTransaction((repos) => repos.sales.deleteParkedCart(cartId))
      setParkedCarts((prev) => prev.filter((c) => c.id !== cartId))
    } catch (error) {
      console.error('Failed to delete parked cart:', error)
    }
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 flex flex-col p-0" data-scan-exempt>
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-xl font-semibold text-foreground">{t('checkout.holdResume.title')}</SheetTitle>
          <button
            onClick={onClose}
            aria-label={t('checkout.holdResume.closeAria')}
            className="text-2xl font-bold text-foreground hover:text-foreground/80 leading-none"
          >
            ✕
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-foreground">
              {t('checkout.holdResume.loading')}
            </div>
          ) : parkedCarts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-foreground px-4">
              {t('checkout.holdResume.empty')}
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
                          {t('checkout.holdResume.itemsCount', { count: number(cart.lines.length) }, cart.lines.length)}
                        </div>
                        <div className="text-sm text-foreground">
                          {date(cart.createdAt, { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="font-bold text-foreground tabular-nums">
                        {money(subtotal)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResume(
                            cart.lines.map((line) => ({
                              variantId: line.variantId,
                              name: line.name,
                              barcode: line.barcode,
                              price: line.price,
                              quantity: line.quantity,
                              discount: line.discount
                                ? {
                                    type: (line.discount.type === 'fixed_amount'
                                      ? 'fixed'
                                      : 'percentage') as 'percentage' | 'fixed',
                                    amount: line.discount.amount,
                                  }
                                : undefined,
                            })),
                          )
                          onClose()
                        }}
                        className="flex-1 px-3 py-2 bg-success text-[var(--on-success)] rounded-[var(--radius-input)] hover:bg-success/90 font-semibold text-sm"
                      >
                        {t('checkout.holdResume.resume')}
                      </button>
                      <button
                        onClick={() => handleDelete(cart.id)}
                        aria-label={t('checkout.holdResume.deleteAria', { count: number(cart.lines.length) }, cart.lines.length)}
                        className="flex-1 px-3 py-2 border border-danger text-danger rounded-[var(--radius-input)] hover:bg-danger/10 font-semibold text-sm"
                      >
                        {t('checkout.holdResume.delete')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
