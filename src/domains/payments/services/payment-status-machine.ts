import { PAYMENT_STATUS, type PaymentStatus } from '@constants/enums'

export function isValidPaymentStatusTransition(
  from: PaymentStatus | null,
  to: PaymentStatus,
): boolean {
  if (from === null) {
    // Initial creation can transition to PENDING, AUTHORIZED, CAPTURED, or FAILED
    return [
      PAYMENT_STATUS.PENDING,
      PAYMENT_STATUS.AUTHORIZED,
      PAYMENT_STATUS.CAPTURED,
      PAYMENT_STATUS.FAILED,
    ].includes(to)
  }

  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PAYMENT_STATUS.PENDING]: [
      PAYMENT_STATUS.AUTHORIZED,
      PAYMENT_STATUS.CAPTURED,
      PAYMENT_STATUS.FAILED,
    ],
    [PAYMENT_STATUS.AUTHORIZED]: [
      PAYMENT_STATUS.CAPTURED,
      PAYMENT_STATUS.FAILED,
      PAYMENT_STATUS.VOIDED,
    ],
    [PAYMENT_STATUS.CAPTURED]: [
      PAYMENT_STATUS.PARTIALLY_REFUNDED,
      PAYMENT_STATUS.REFUNDED,
      PAYMENT_STATUS.VOIDED,
    ],
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]: [PAYMENT_STATUS.REFUNDED],
    [PAYMENT_STATUS.REFUNDED]: [],
    [PAYMENT_STATUS.FAILED]: [],
    [PAYMENT_STATUS.VOIDED]: [],
  }

  return validTransitions[from]?.includes(to) ?? false
}
