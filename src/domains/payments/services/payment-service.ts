import { PAYMENT_STATUS, type PaymentMethod, type PaymentStatus } from '@constants/enums'
import type { Payment } from '@domains/payments/entities/payment'
import type { PaymentsRepository } from '@domains/payments/repository'
import type { CustomersRepository } from '@domains/customers/repository'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import { resolvePaymentGateway } from '@infra/payments'
import { assertSplitPaymentsCoverTotal } from '../lib/split-payment'
import { isValidPaymentStatusTransition } from './payment-status-machine'
import { InvalidPaymentStatusTransitionError } from '../errors'

export class PaymentService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
  ) {}

  async chargeSplitPayments(
    repos: { payments: PaymentsRepository; customers: CustomersRepository },
    ctx: { clock: Clock; ids: IdGenerator },
    input: {
      saleId: string
      currency: string
      total: number
      requests: Array<{
        id: string
        amount: number
        method: PaymentMethod
        gateway: string
        tendered?: number
        customerId?: string
        idempotencyKey?: string
      }>
    },
  ): Promise<Payment[]> {
    assertSplitPaymentsCoverTotal(input.requests, input.total)

    const payments: Payment[] = []

    for (const request of input.requests) {
      // Check for idempotency
      const existing = await repos.payments.findPaymentById(request.id)
      if (existing) {
        payments.push(existing)
        continue
      }

      const gateway = resolvePaymentGateway(request.gateway)
      const idempotencyKey = request.idempotencyKey || request.id

      let chargeResult: Awaited<ReturnType<typeof gateway.charge>> | null = null
      let failureReason: string | undefined

      try {
        chargeResult = await gateway.charge(
          {
            saleId: input.saleId,
            paymentId: request.id,
            amount: request.amount,
            currency: input.currency,
            idempotencyKey,
            tendered: request.tendered,
            customerId: request.customerId,
          },
          { repos, clock: this.clock, ids: this.ids },
        )
      } catch (error) {
        // Convert gateway error to FAILED payment result
        chargeResult = { status: PAYMENT_STATUS.FAILED }
        failureReason = error instanceof Error ? error.message : String(error)
      }

      const status = chargeResult.status || PAYMENT_STATUS.PENDING

      const payment: Payment = {
        id: request.id,
        saleId: input.saleId,
        amount: request.amount,
        currency: input.currency,
        method: request.method,
        gateway: request.gateway,
        gatewayRef: chargeResult.gatewayRef,
        idempotencyKey,
        status,
        tendered: request.tendered,
        changeDue: chargeResult.changeDue,
        customerId: request.customerId,
        failureReason,
        createdAt: this.clock.now(),
        updatedAt: this.clock.now(),
      }

      await repos.payments.savePayment(payment)
      await repos.payments.appendStatusEvent({
        id: this.ids.generate(),
        paymentId: payment.id,
        fromStatus: null,
        toStatus: status,
        createdAt: this.clock.now(),
      })

      payments.push(payment)
    }

    return payments
  }

  async recordStatusTransition(
    repos: { payments: PaymentsRepository },
    paymentId: string,
    toStatus: PaymentStatus,
    opts?: { reason?: string; actorId?: string },
  ): Promise<Payment> {
    const payment = await repos.payments.findPaymentById(paymentId)
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`)
    }

    if (!isValidPaymentStatusTransition(payment.status, toStatus)) {
      throw new InvalidPaymentStatusTransitionError(
        `Cannot transition from ${payment.status} to ${toStatus}`,
      )
    }

    const updated = {
      ...payment,
      status: toStatus,
      updatedAt: this.clock.now(),
    }

    await repos.payments.savePayment(updated)
    await repos.payments.appendStatusEvent({
      id: this.ids.generate(),
      paymentId: payment.id,
      fromStatus: payment.status,
      toStatus,
      reason: opts?.reason,
      actorId: opts?.actorId,
      createdAt: this.clock.now(),
    })

    return updated
  }
}
