export const REFUND_STATUS = {
  PENDING: 1,
  COMPLETED: 2,
  FAILED: 3,
} as const

export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS]
