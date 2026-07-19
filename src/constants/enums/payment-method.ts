export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  CHECK: 'check',
  STORE_CREDIT: 'store_credit',
  OTHER: 'other',
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]
