export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  CHECK: 'check',
  OTHER: 'other',
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]
