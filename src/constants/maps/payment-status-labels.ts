import { PAYMENT_STATUS, type PaymentStatus } from '@constants/enums/payment-status'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.AUTHORIZED]: 'Authorized',
  [PAYMENT_STATUS.CAPTURED]: 'Captured',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Partially Refunded',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.VOIDED]: 'Voided',
}
