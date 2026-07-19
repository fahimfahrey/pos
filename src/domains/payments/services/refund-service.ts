import { PAYMENT_STATUS, REFUND_STATUS } from '@constants/enums'
import type { Refund, RefundedItem } from '@domains/payments/entities/payment'
import type { PaymentsRepository } from '@domains/payments/repository'
import type { CustomersRepository } from '@domains/customers/repository'
import type { InventoryRepository } from '@domains/inventory/repository'
import type { SalesRepository } from '@domains/sales/repository'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import { resolvePaymentGateway } from '@infra/payments'
import { InventoryService } from '@domains/inventory/services/inventory-service'
import { PaymentService } from './payment-service'
import { RefundExceedsPaymentError } from '../errors'

export interface RefundInput {
  id: string
  paymentId: string
  saleId: string
  orgId: string
  branchId: string
  amount: number
  reason: string
  items?: RefundedItem[]
  initiatedBy: string
}

export class RefundService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
    private inventory: InventoryService,
    private paymentService: PaymentService,
  ) {}

  async refund(
    repos: {
      payments: PaymentsRepository
      sales: SalesRepository
      inventory: InventoryRepository
      customers: CustomersRepository
    },
    input: RefundInput,
  ): Promise<Refund> {
    const payment = await repos.payments.findPaymentById(input.paymentId)
    if (!payment) {
      throw new Error(`Payment ${input.paymentId} not found`)
    }

    // Check if refund would exceed available balance
    const existingRefunds = await repos.payments.listRefundsForPayment(input.paymentId)
    const alreadyRefunded = existingRefunds
      .filter((r) => r.status === REFUND_STATUS.COMPLETED)
      .reduce((sum, r) => sum + r.amount, 0)

    if (input.amount > payment.amount - alreadyRefunded) {
      throw new RefundExceedsPaymentError(
        `Refund amount ${input.amount} exceeds available ${payment.amount - alreadyRefunded}`,
      )
    }

    // Call gateway refund
    const gateway = resolvePaymentGateway(payment.gateway)
    const refundResult = await gateway.refund(
      {
        paymentId: input.paymentId,
        gatewayRef: payment.gatewayRef,
        amount: input.amount,
        currency: payment.currency,
        idempotencyKey: input.id,
        reason: input.reason,
        customerId: payment.customerId,
      },
      { repos, clock: this.clock, ids: this.ids },
    )

    // Create refund record
    const refund: Refund = {
      id: input.id,
      paymentId: input.paymentId,
      saleId: input.saleId,
      amount: input.amount,
      currency: payment.currency,
      reason: input.reason,
      status: refundResult.status,
      gatewayRef: refundResult.gatewayRef,
      initiatedBy: input.initiatedBy,
      refundedItems: input.items || [],
      createdAt: this.clock.now(),
    }

    if (refundResult.status === REFUND_STATUS.COMPLETED) {
      refund.completedAt = this.clock.now()
    }

    await repos.payments.saveRefund(refund)

    // Process stock reversals if items were specified
    if (input.items && input.items.length > 0) {
      for (const item of input.items) {
        await this.inventory.recordReturn(repos, {
          orgId: input.orgId,
          branchId: input.branchId,
          variantId: item.variantId,
          quantity: item.quantity,
          reference: refund.id,
          createdBy: input.initiatedBy,
          allowOversell: true,
        })
      }
    }

    // Update payment status
    const totalRefunded =
      alreadyRefunded + (refundResult.status === REFUND_STATUS.COMPLETED ? input.amount : 0)
    const newStatus =
      totalRefunded >= payment.amount ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIALLY_REFUNDED

    await this.paymentService.recordStatusTransition(repos, payment.id, newStatus, {
      reason: input.reason,
      actorId: input.initiatedBy,
    })

    return refund
  }
}
