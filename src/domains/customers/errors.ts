import { AppError } from '@shared/errors'

export class InsufficientStoreCreditError extends AppError {
  constructor(message = 'Insufficient store credit for this transaction') {
    super('INSUFFICIENT_STORE_CREDIT', 409, message)
    Object.setPrototypeOf(this, InsufficientStoreCreditError.prototype)
  }
}

export class InsufficientLoyaltyPointsError extends AppError {
  constructor(message = 'Insufficient loyalty points for this transaction') {
    super('INSUFFICIENT_LOYALTY_POINTS', 409, message)
    Object.setPrototypeOf(this, InsufficientLoyaltyPointsError.prototype)
  }
}

export class LoyaltyNotEnabledError extends AppError {
  constructor(message = 'Loyalty program is not enabled') {
    super('LOYALTY_NOT_ENABLED', 409, message)
    Object.setPrototypeOf(this, LoyaltyNotEnabledError.prototype)
  }
}
