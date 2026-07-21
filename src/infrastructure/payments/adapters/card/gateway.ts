import { PAYMENT_STATUS, REFUND_STATUS } from '@constants/enums'
import type { PaymentGateway, ChargeRequest, ChargeResult, RefundRequest, RefundResult, PaymentGatewayContext } from '@domains/payments/ports/payment-gateway'
import { paymentsEventBus } from '@infra/events/payments-event-bus'

interface PendingCharge {
  idempotencyKey: string
  resolvesAt: number
  outcome: 'captured' | 'failed'
}

export class CardGateway implements PaymentGateway {
  readonly id = 'card'
  readonly requiresServer = true

  private pendingCharges = new Map<string, PendingCharge>()

  constructor(
    private behavior: 'capture' | 'decline' | 'pending' | 'random' = 'random',
    private latencyMs = 1200,
    private pendingResolutionMs = 4000,
  ) {}

  async charge(request: ChargeRequest, ctx: PaymentGatewayContext): Promise<ChargeResult> {
    const idempotencyKey = request.idempotencyKey

    // Check if this is a retry of a pending charge
    const pending = this.pendingCharges.get(idempotencyKey)
    if (pending) {
      const now = Date.now()
      if (now < pending.resolvesAt) {
        // Still pending
        return {
          status: PAYMENT_STATUS.PENDING,
        }
      }
      // Resolved, return cached outcome
      const status = pending.outcome === 'captured' ? PAYMENT_STATUS.CAPTURED : PAYMENT_STATUS.FAILED
      this.pendingCharges.delete(idempotencyKey)
      return { status }
    }

    // Determine behavior
    let behavior = this.behavior
    if (behavior === 'random') {
      const rand = Math.random()
      if (rand < 0.8) {
        behavior = 'capture'
      } else if (rand < 0.9) {
        behavior = 'decline'
      } else {
        behavior = 'pending'
      }
    }

    if (behavior === 'pending') {
      // Store pending charge and return PENDING status
      const resolvesAt = Date.now() + this.pendingResolutionMs
      const outcome = Math.random() < 0.8 ? 'captured' : 'failed'
      this.pendingCharges.set(idempotencyKey, { idempotencyKey, resolvesAt, outcome })

      paymentsEventBus.publish({
        type: 'payment.pending',
        paymentId: request.paymentId,
        saleId: request.saleId,
        gateway: this.id,
      })

      return {
        status: PAYMENT_STATUS.PENDING,
      }
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs))

    if (behavior === 'capture') {
      paymentsEventBus.publish({
        type: 'payment.captured',
        paymentId: request.paymentId,
        saleId: request.saleId,
        gateway: this.id,
      })

      return {
        status: PAYMENT_STATUS.CAPTURED,
      }
    }

    // decline
    paymentsEventBus.publish({
      type: 'payment.failed',
      paymentId: request.paymentId,
      saleId: request.saleId,
      gateway: this.id,
      reason: 'Card declined',
    })

    throw new Error('Card declined')
  }

  async refund(request: RefundRequest, ctx: PaymentGatewayContext): Promise<RefundResult> {
    // Simulate refund processing
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs))

    paymentsEventBus.publish({
      type: 'payment.refunded',
      paymentId: request.paymentId,
      saleId: request.customerId || 'unknown',
      gateway: this.id,
    })

    return {
      status: REFUND_STATUS.COMPLETED,
    }
  }
}
