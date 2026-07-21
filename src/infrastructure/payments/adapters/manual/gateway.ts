import { PAYMENT_STATUS, REFUND_STATUS } from '@constants/enums'
import type { PaymentGateway, ChargeRequest, ChargeResult, RefundRequest, RefundResult, PaymentGatewayContext } from '@domains/payments/ports/payment-gateway'
import { paymentsEventBus } from '@infra/events/payments-event-bus'

export class ManualGateway implements PaymentGateway {
  readonly id = 'manual'
  readonly requiresServer = false

  async charge(request: ChargeRequest, ctx: PaymentGatewayContext): Promise<ChargeResult> {
    // Manual tenders (check, other) settle synchronously
    // Compute change due if tendered amount is provided
    const changeDue = request.tendered ? (request.tendered - request.amount) / 100 : 0

    paymentsEventBus.publish({
      type: 'payment.captured',
      paymentId: request.paymentId,
      saleId: request.saleId,
      gateway: this.id,
    })

    return {
      status: PAYMENT_STATUS.CAPTURED,
      changeDue: changeDue > 0 ? changeDue : 0,
    }
  }

  async refund(request: RefundRequest, ctx: PaymentGatewayContext): Promise<RefundResult> {
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
