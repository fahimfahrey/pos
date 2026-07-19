// eslint-disable-next-line boundaries/no-unknown
import type { PaymentsRepository } from '@domains/payments/repository'
 
import type { Payment, Refund } from '@domains/payments/entities/payment'
import type { PaymentStatusEvent } from '@domains/payments/entities/payment-status-event'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CorePaymentsRepository implements PaymentsRepository {
  private paymentCollection: Collection<Payment>
  private refundCollection: Collection<Refund>
  private paymentStatusEventCollection: Collection<PaymentStatusEvent>

  constructor(tx: DriverTransaction) {
    this.paymentCollection = new Collection<Payment>(tx, 'payments')
    this.refundCollection = new Collection<Refund>(tx, 'refunds')
    this.paymentStatusEventCollection = new Collection<PaymentStatusEvent>(tx, 'paymentStatusEvents')
  }

  async savePayment(payment: Payment): Promise<void> {
    await this.paymentCollection.put(payment)
  }

  async findPaymentById(id: string): Promise<Payment | null> {
    return (await this.paymentCollection.get(id)) ?? null
  }

  async listPaymentsForSale(saleId: string): Promise<Payment[]> {
    return this.paymentCollection.filter((p) => p.saleId === saleId)
  }

  async saveRefund(refund: Refund): Promise<void> {
    await this.refundCollection.put(refund)
  }

  async listRefundsForPayment(paymentId: string): Promise<Refund[]> {
    return this.refundCollection.filter((r) => r.paymentId === paymentId)
  }

  async listPaymentsByDateRange(from: Date, to: Date): Promise<Payment[]> {
    return this.paymentCollection.filter((p) => p.createdAt >= from && p.createdAt <= to)
  }

  async findRefundById(id: string): Promise<Refund | null> {
    return (await this.refundCollection.get(id)) ?? null
  }

  async listRefundsForSale(saleId: string): Promise<Refund[]> {
    return this.refundCollection.filter((r) => r.saleId === saleId)
  }

  async appendStatusEvent(event: PaymentStatusEvent): Promise<void> {
    await this.paymentStatusEventCollection.put(event)
  }

  async listStatusEvents(paymentId: string): Promise<PaymentStatusEvent[]> {
    return this.paymentStatusEventCollection.filter((e) => e.paymentId === paymentId)
  }
}
