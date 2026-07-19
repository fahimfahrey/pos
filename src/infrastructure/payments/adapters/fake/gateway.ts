import { PAYMENT_STATUS, REFUND_STATUS } from '@constants/enums'
import type { PaymentGateway, ChargeRequest, ChargeResult, RefundRequest, RefundResult, PaymentGatewayContext } from '@domains/payments/ports/payment-gateway'

export type FakeBehavior = 'always-capture' | 'always-decline' | 'always-pending'

export class FakeGateway implements PaymentGateway {
  readonly id = 'fake'
  readonly requiresServer = true

  private chargeMap = new Map<string, ChargeResult>()
  private refundMap = new Map<string, RefundResult>()

  constructor(private behavior: FakeBehavior = 'always-capture') {}

  async charge(request: ChargeRequest, ctx: PaymentGatewayContext): Promise<ChargeResult> {
    // Check idempotency
    if (this.chargeMap.has(request.idempotencyKey)) {
      return this.chargeMap.get(request.idempotencyKey)!
    }

    const gatewayRef = `fake-ch-${Math.random().toString(36).substring(7)}`

    const result: ChargeResult = {
      status:
        this.behavior === 'always-capture'
          ? PAYMENT_STATUS.CAPTURED
          : this.behavior === 'always-decline'
            ? PAYMENT_STATUS.FAILED
            : PAYMENT_STATUS.PENDING,
      gatewayRef,
    }

    this.chargeMap.set(request.idempotencyKey, result)
    return result
  }

  async refund(request: RefundRequest, ctx: PaymentGatewayContext): Promise<RefundResult> {
    // Check idempotency
    if (this.refundMap.has(request.idempotencyKey)) {
      return this.refundMap.get(request.idempotencyKey)!
    }

    const gatewayRef = `fake-ref-${Math.random().toString(36).substring(7)}`

    const result: RefundResult = {
      status:
        this.behavior === 'always-capture'
          ? REFUND_STATUS.COMPLETED
          : this.behavior === 'always-decline'
            ? REFUND_STATUS.FAILED
            : REFUND_STATUS.PENDING,
      gatewayRef,
    }

    this.refundMap.set(request.idempotencyKey, result)
    return result
  }
}
