'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { createDefaultStorageProvider } from '@infra/storage'
import { SystemClock } from '@domains/system/services/clock'
import { UuidIdGenerator } from '@domains/system/services/uuid-id-generator'
import { usePosCart } from '../_lib/pos-cart-context'
import { useBarcodeScanner } from '../_lib/use-barcode-scanner'
import { useScanFeedback } from '../_lib/use-scan-feedback'
import { useKeyboardShortcuts } from '../_lib/use-keyboard-shortcuts'
import { useOnlineStatus } from '../_lib/use-online-status'
import { getOutbox } from '../_lib/register-outbox'
import type { Register } from '@domains/organization/entities/register'
import type { Shift } from '@domains/sales/entities/shift'
import type { PricedCart } from '@domains/sales/entities/priced-cart'
import { RegisterHeader } from './register-header'
import { ScanInput } from './scan-input'
import { ScanFeedbackBanner } from './scan-feedback-banner'
import { CartList } from './cart-list'
import { RunningTotal } from './running-total'
import { PaymentSheet } from './payment-sheet'
import { VoidSaleModal } from './void-sale-modal'
import { HoldResumeDrawer } from './hold-resume-drawer'
import { EmptyCartState } from './empty-cart-state'
import { KeyboardShortcutsHelp } from './keyboard-shortcuts-help'

interface RegisterLayoutProps {
  register: Register
  shift: Shift
  cashierId: string
  cashierName: string
  orgId: string
}

export function RegisterLayout({
  register,
  shift,
  cashierId,
  cashierName,
  orgId,
}: RegisterLayoutProps) {
  const router = useRouter()
  const { state, dispatch } = usePosCart()
  const [pricedCart, setPricedCart] = useState<PricedCart | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showVoid, setShowVoid] = useState(false)
  const [showHeld, setShowHeld] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showCartDiscount, setShowCartDiscount] = useState(false)
  const isOnline = useOnlineStatus()
  const { inputRef, focus: focusScanInput } = useBarcodeScanner({
    onScan: handleBarcodeScan,
    exemptSelectors: ['[data-scan-exempt]'],
  })

  const { feedback, handleScan } = useScanFeedback((itemName: string) => {
    // Scan successful, item found - dispatch to add it to cart
    // The actual addition happens via scan lookup in useScanFeedback
  })

  // Price the cart whenever lines or discount changes (simplified pricing)
  useEffect(() => {
    const calculatePricing = () => {
      if (state.lines.length === 0) {
        setPricedCart(null)
        return
      }

      // Simplified pricing: calculate totals locally
      let subtotal = 0
      let tax = 0

      for (const line of state.lines) {
        const lineSubtotal = (line.price * line.quantity) / 100
        const lineDiscount = line.discount
          ? line.discount.type === 'percentage'
            ? (lineSubtotal * line.discount.amount) / 100
            : line.discount.amount / 100
          : 0

        subtotal += lineSubtotal - lineDiscount
        tax += (lineSubtotal - lineDiscount) * 0.1 // Simplified 10% tax
      }

      const cartDiscount = state.cartDiscount
        ? state.cartDiscount.type === 'percentage'
          ? (subtotal * state.cartDiscount.amount) / 100
          : state.cartDiscount.amount / 100
        : 0

      const total = Math.round((subtotal - cartDiscount + tax) * 100)

      setPricedCart({
        lines: [], // Simplified
        subtotal: Math.round(subtotal * 100),
        discount: Math.round(cartDiscount * 100),
        tax: Math.round(tax * 100),
        total,
        taxByRate: {},
      })
    }

    calculatePricing()
  }, [state.lines, state.cartDiscount])

  async function handleBarcodeScan(code: string) {
    await handleScan(code)
  }

  const handlePayment = () => {
    setShowPayment(true)
  }

  const handleHoldCart = async () => {
    if (state.lines.length === 0) {
      return
    }

    try {
      const provider = createDefaultStorageProvider()
      const repos = await provider.getRepositorySet()
      const clock = new SystemClock()
      const idGen = new UuidIdGenerator()

      const parkedCart = {
        id: idGen.generate(),
        registerId: register.id,
        shiftId: shift.id,
        lines: state.lines,
        createdAt: clock.now(),
        createdBy: cashierId,
      }

      await repos.sales.createParkedCart(parkedCart)
      dispatch({ type: 'HOLD_CART' })
      focusScanInput()
    } catch (error) {
      console.error('Failed to hold cart:', error)
    }
  }

  const handleVoidCart = () => {
    setShowVoid(true)
  }

  const handleConfirmVoid = () => {
    dispatch({ type: 'RESET' })
    setPricedCart(null)
    setShowVoid(false)
    focusScanInput()
  }

  const handleFinalizeSale = async (paymentMethod: string, amount: number, tendered?: number) => {
    if (!pricedCart) return

    try {
      const provider = createDefaultStorageProvider()
      const repos = await provider.getRepositorySet()
      const { resolveSettings } = await import('@domains/organization/services/settings-resolver')
      const { FinalizeSaleService } = await import('@domains/sales/services/finalize-sale-service')
      const clock = new SystemClock()
      const idGen = new UuidIdGenerator()

      // Resolve settings
      const settings = await resolveSettings(repos, orgId, register.branchId || 'default')

      const saleId = idGen.generate()

      // Build payment input
      const paymentId = idGen.generate()
      const payments = [
        {
          id: paymentId,
          amount,
          method: paymentMethod as any, // Cast from Tabs value to PaymentMethod
          tendered,
          idempotencyKey: paymentId,
        },
      ]

      // Build sale input
      const saleInput = {
        saleId,
        shiftId: shift.id,
        orgId,
        branchId: register.branchId || 'default',
        createdBy: cashierId,
        lines: state.lines.map((line) => ({
          variantId: line.variantId,
          quantity: line.quantity,
          discount: line.discount,
        })),
        cartDiscount: state.cartDiscount,
        payments,
      }

      // Finalize sale
      const service = new FinalizeSaleService(clock, idGen)
      const result = await service.finalize(repos, settings, saleInput)

      if (result.outcome === 'paid' && result.sale) {
        getOutbox().markResolved(`sale-${saleId}`)
        dispatch({ type: 'RESET' })
        setPricedCart(null)
        setShowPayment(false)
        router.push(`/pos/receipt/${saleId}`)
      } else {
        // Payment declined - keep sheet open
        setShowPayment(true)
      }
    } catch (error) {
      console.error('Failed to finalize sale:', error)
    }
  }

  const handleUndoScan = () => {
    dispatch({ type: 'UNDO_LAST_SCAN' })
  }

  const handleCloseModal = () => {
    setShowPayment(false)
    setShowVoid(false)
    setShowHeld(false)
    setShowHelp(false)
    setShowCartDiscount(false)
    focusScanInput()
  }

  useKeyboardShortcuts({
    onPayment: handlePayment,
    onHoldCart: handleHoldCart,
    onShowHeld: () => setShowHeld(true),
    onVoidSale: handleVoidCart,
    onUndoScan: handleUndoScan,
    onCloseModal: handleCloseModal,
    onShowHelp: () => setShowHelp(true),
    onCartDiscount: () => setShowCartDiscount(true),
  })

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      <RegisterHeader
        registerName={register.name}
        registerNumber={register.number}
        cashierName={cashierName}
        shiftStartedAt={shift.startedAt}
        isOnline={isOnline}
      />

      <ScanInput ref={inputRef} />

      <ScanFeedbackBanner feedback={feedback} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {state.lines.length === 0 ? (
          <EmptyCartState />
        ) : (
          <>
            <CartList
              lines={state.lines}
              onQtyChange={(index, qty) =>
                dispatch({ type: 'SET_QTY', lineIndex: index, quantity: qty })
              }
              onRemove={(index) => dispatch({ type: 'REMOVE_LINE', lineIndex: index })}
              onDiscountChange={(index, discount) =>
                dispatch({ type: 'SET_LINE_DISCOUNT', lineIndex: index, discount })
              }
            />

            {pricedCart && (
              <RunningTotal
                subtotal={pricedCart.subtotal}
                tax={pricedCart.tax}
                total={pricedCart.total}
              />
            )}
          </>
        )}
      </div>

      <div className="border-t border-border p-4 short:p-2 pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-2">
        <button
          onClick={handleHoldCart}
          disabled={state.lines.length === 0}
          className="flex-1 h-14 mouse:h-11 px-4 font-semibold border border-border bg-surface text-foreground rounded-[var(--radius-button)] hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-scan-exempt
        >
          Hold (F3)
        </button>

        <button
          onClick={handleVoidCart}
          disabled={state.lines.length === 0}
          className="flex-1 h-14 mouse:h-11 px-4 font-semibold border border-border bg-surface text-foreground rounded-[var(--radius-button)] hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-scan-exempt
        >
          Void (F6)
        </button>

        <button
          onClick={handlePayment}
          disabled={state.lines.length === 0}
          className="flex-1 h-14 mouse:h-11 px-4 font-semibold font-bold bg-accent text-accent-foreground rounded-[var(--radius-button)] hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          data-scan-exempt
        >
          Pay (F2)
        </button>
      </div>

      {/* Modals and drawers */}
      {/* Modals and drawers */}
      {pricedCart && (
        <PaymentSheet
          total={pricedCart.total}
          open={showPayment}
          onClose={handleCloseModal}
          onFinalize={handleFinalizeSale}
        />
      )}

      {showVoid && (
        <VoidSaleModal
          onClose={() => setShowVoid(false)}
          onConfirm={handleConfirmVoid}
        />
      )}

      {showHeld && (
        <HoldResumeDrawer
          registerId={register.id}
          onClose={() => setShowHeld(false)}
          onResume={(lines) => {
            dispatch({ type: 'RESUME_CART', lines })
            setShowHeld(false)
            focusScanInput()
          }}
        />
      )}

      {showHelp && (
        <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}
