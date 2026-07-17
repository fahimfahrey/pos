import type { Payment, Refund } from '@domains/payments/entities/payment'

export interface PaymentsRepository {
  savePayment(payment: Payment): Promise<void>
  findPaymentById(id: string): Promise<Payment | null>
  listPaymentsForOrder(orderId: string): Promise<Payment[]>
  saveRefund(refund: Refund): Promise<void>
  listRefundsForPayment(paymentId: string): Promise<Refund[]>
  listPaymentsByDateRange(from: Date, to: Date): Promise<Payment[]>
}
