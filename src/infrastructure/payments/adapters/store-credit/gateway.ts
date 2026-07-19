import { PAYMENT_STATUS, REFUND_STATUS } from '@constants/enums'
import type { PaymentGateway, ChargeRequest, ChargeResult, RefundRequest, RefundResult, PaymentGatewayContext } from '@domains/payments/ports/payment-gateway'
import { StoreCreditService } from '@domains/customers/services/store-credit-service'

export class StoreCreditGateway implements PaymentGateway {
  readonly id = 'store-credit'
  readonly requiresServer = false

  async charge(request: ChargeRequest, ctx: PaymentGatewayContext): Promise<ChargeResult> {
    if (!request.customerId) {
      throw new Error('Store credit gateway requires customerId')
    }

    const service = new StoreCreditService(ctx.clock, ctx.ids)
    await service.redeem(ctx.repos, {
      customerId: request.customerId,
      amount: request.amount,
      reference: request.saleId,
      createdBy: 'system',
    })

    return {
      status: PAYMENT_STATUS.CAPTURED,
    }
  }

  async refund(request: RefundRequest, ctx: PaymentGatewayContext): Promise<RefundResult> {
    if (!request.customerId) {
      throw new Error('Store credit gateway refund requires customerId')
    }

    const service = new StoreCreditService(ctx.clock, ctx.ids)
    await service.issue(ctx.repos, {
      customerId: request.customerId,
      amount: request.amount,
      reference: request.paymentId,
      createdBy: 'system',
    })

    return {
      status: REFUND_STATUS.COMPLETED,
    }
  }
}
