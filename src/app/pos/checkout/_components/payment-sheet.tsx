'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@shared/components/ui/sheet'
import { Button } from '@shared/components/ui/button'
import { Badge } from '@shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs'
import { ChangeDisplay } from './payment-sheet/change-display'
import { SplitPaymentList } from './payment-sheet/split-payment-list'
import { formatMoney } from '../_lib/format-money'
import { playFeedbackSound } from '../_lib/scan-sound'

interface PaymentSheetProps {
  total: number
  open: boolean
  onClose: () => void
  onFinalize: (method: string, amount: number, tendered?: number) => Promise<void>
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'store_credit', label: 'Store Credit' },
  { id: 'check', label: 'Check' },
  { id: 'other', label: 'Other' },
]

const DENOMINATIONS = [
  { value: 100, label: '$1' },
  { value: 500, label: '$5' },
  { value: 1000, label: '$10' },
  { value: 2000, label: '$20' },
  { value: 5000, label: '$50' },
  { value: 10000, label: '$100' },
]

export function PaymentSheet({ total, open, onClose, onFinalize }: PaymentSheetProps) {
  const [method, setMethod] = useState('cash')
  const [tendered, setTendered] = useState(0)
  const [amount, setAmount] = useState(String(total / 100))
  const [loading, setLoading] = useState(false)

  const numAmount = parseFloat(amount) || 0
  const numAmountCents = Math.round(numAmount * 100)
  const tenderedCents = Math.round(tendered * 100)
  const change = tenderedCents - numAmountCents

  const handleAddDenomination = (denomination: number) => {
    setTendered((t) => t + denomination / 100)
  }

  const handleCompletePayment = async () => {
    setLoading(true)
    try {
      await onFinalize(method, numAmountCents, method === 'cash' ? tenderedCents : undefined)
      playFeedbackSound('payment-complete')
    } catch (error) {
      playFeedbackSound('error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader>
          <SheetTitle>Payment</SheetTitle>
          <SheetDescription>Enter payment details</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Amount Display */}
          <div className="bg-background rounded-[var(--radius-card)] p-4 border border-border">
            <div className="text-sm text-foreground mb-1">Total Due</div>
            <div className="font-display text-display-2xl tabular-nums font-bold text-foreground">
              {formatMoney(total)}
            </div>
          </div>

          {/* Method Selection */}
          <Tabs value={method} onValueChange={setMethod} className="w-full">
            <TabsList className="w-full grid grid-cols-5">
              {PAYMENT_METHODS.map((m) => (
                <TabsTrigger key={m.id} value={m.id} className="text-xs">
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Cash Method */}
            <TabsContent value="cash" className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Tendered Amount
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={tendered === 0 ? '' : tendered.toFixed(2)}
                  onChange={(e) => setTendered(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  className="w-full px-3 py-3 border border-border rounded-[var(--radius-input)] text-foreground bg-background text-lg font-semibold"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DENOMINATIONS.map((denom) => (
                  <Button
                    key={denom.value}
                    onClick={() => handleAddDenomination(denom.value)}
                    variant="secondary"
                    size="register"
                    disabled={loading}
                    aria-label={`Add ${denom.label}`}
                  >
                    {denom.label}
                  </Button>
                ))}
              </div>

              {change >= 0 ? (
                <ChangeDisplay changeDue={change} />
              ) : (
                <ChangeDisplay changeDue={0} shortBy={Math.abs(change)} />
              )}
            </TabsContent>

            {/* Card Method */}
            <TabsContent value="card" className="space-y-4 mt-4">
              <div className="bg-background rounded-[var(--radius-card)] p-4 border border-border text-center">
                <div className="text-sm text-foreground mb-2">Card will be charged</div>
                <div className="font-display text-2xl tabular-nums font-bold text-foreground">
                  {formatMoney(total)}
                </div>
              </div>
            </TabsContent>

            {/* Other methods */}
            {['store_credit', 'check', 'other'].map((m) => (
              <TabsContent key={m} value={m} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    className="w-full px-3 py-3 border border-border rounded-[var(--radius-input)] text-foreground bg-background text-lg font-semibold"
                    disabled={loading}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              onClick={onClose}
              disabled={loading}
              variant="secondary"
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompletePayment}
              disabled={loading || (method === 'cash' && change < 0)}
              className="flex-1 h-12"
            >
              {loading ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
