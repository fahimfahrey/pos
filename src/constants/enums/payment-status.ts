export const PAYMENT_STATUS = {
  PENDING: 1,
  AUTHORIZED: 2,
  CAPTURED: 3,
  PARTIALLY_REFUNDED: 4,
  REFUNDED: 5,
  FAILED: 6,
  VOIDED: 7,
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
