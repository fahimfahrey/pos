import type { Payment, Refund } from '@domains/payments/entities/payment'
import type { PaymentStatusEvent } from '@domains/payments/entities/payment-status-event'

export interface PaymentsRepository {
  savePayment(payment: Payment): Promise<void>
  findPaymentById(id: string): Promise<Payment | null>
  listPaymentsForSale(saleId: string): Promise<Payment[]>
  saveRefund(refund: Refund): Promise<void>
  listRefundsForPayment(paymentId: string): Promise<Refund[]>
  findRefundById(id: string): Promise<Refund | null>
  listRefundsForSale(saleId: string): Promise<Refund[]>
  appendStatusEvent(event: PaymentStatusEvent): Promise<void>
  listStatusEvents(paymentId: string): Promise<PaymentStatusEvent[]>
  listPaymentsByDateRange(from: Date, to: Date): Promise<Payment[]>
}
