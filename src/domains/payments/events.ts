export type PaymentEvent =
  | { type: 'payment.captured'; paymentId: string; saleId: string; gateway: string }
  | { type: 'payment.failed'; paymentId: string; saleId: string; gateway: string; reason?: string }
  | { type: 'payment.refunded'; refundId: string; paymentId: string; saleId: string }
  | { type: 'drawer.kick'; paymentId: string; saleId: string; registerId?: string }
