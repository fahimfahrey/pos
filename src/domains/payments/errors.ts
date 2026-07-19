import { AppError } from '@shared/errors'

export class GatewayNotRegisteredError extends AppError {
  constructor(message = 'Payment gateway not registered') {
    super('GATEWAY_NOT_REGISTERED', 500, message)
    Object.setPrototypeOf(this, GatewayNotRegisteredError.prototype)
  }
}

export class InvalidPaymentStatusTransitionError extends AppError {
  constructor(message = 'Invalid payment status transition') {
    super('INVALID_PAYMENT_STATUS_TRANSITION', 409, message)
    Object.setPrototypeOf(this, InvalidPaymentStatusTransitionError.prototype)
  }
}

export class RefundExceedsPaymentError extends AppError {
  constructor(message = 'Refund amount exceeds available payment amount') {
    super('REFUND_EXCEEDS_PAYMENT', 409, message)
    Object.setPrototypeOf(this, RefundExceedsPaymentError.prototype)
  }
}

export class SplitPaymentTotalMismatchError extends AppError {
  constructor(message = 'Split payment totals do not match sale total') {
    super('SPLIT_PAYMENT_TOTAL_MISMATCH', 400, message)
    Object.setPrototypeOf(this, SplitPaymentTotalMismatchError.prototype)
  }
}
