import { PAYMENT_STATUS, REFUND_STATUS } from '@constants/enums'
import type { PaymentGateway, ChargeRequest, ChargeResult, RefundRequest, RefundResult, PaymentGatewayContext } from '@domains/payments/ports/payment-gateway'
import { paymentsEventBus } from '@infra/events/payments-event-bus'

export class CashGateway implements PaymentGateway {
  readonly id = 'cash'
  readonly requiresServer = false

  async charge(request: ChargeRequest, ctx: PaymentGatewayContext): Promise<ChargeResult> {
    if (request.tendered === undefined) {
      throw new Error('Cash gateway requires tendered amount')
    }

    if (request.tendered < request.amount) {
      throw new Error('Tendered amount is less than charge amount')
    }

    const amountCents = Math.round(request.amount * 100)
    const tenderedCents = Math.round(request.tendered * 100)
    const changeDueCents = tenderedCents - amountCents

    const changeDue = Math.round(changeDueCents) / 100

    paymentsEventBus.publish({
      type: 'drawer.kick',
      paymentId: request.paymentId,
      saleId: request.saleId,
    })

    paymentsEventBus.publish({
      type: 'payment.captured',
      paymentId: request.paymentId,
      saleId: request.saleId,
      gateway: this.id,
    })

    return {
      status: PAYMENT_STATUS.CAPTURED,
      changeDue,
    }
  }

  async refund(request: RefundRequest, ctx: PaymentGatewayContext): Promise<RefundResult> {
    paymentsEventBus.publish({
      type: 'drawer.kick',
      paymentId: request.paymentId,
      saleId: request.paymentId,
    })

    return {
      status: REFUND_STATUS.COMPLETED,
    }
  }
}
