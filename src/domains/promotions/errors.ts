import { AppError } from '@shared/errors'

export class PromotionNotFoundError extends AppError {
  constructor(message = 'Promotion not found') {
    super('PROMOTION_NOT_FOUND', 404, message)
    Object.setPrototypeOf(this, PromotionNotFoundError.prototype)
  }
}

export class PromotionExpiredError extends AppError {
  constructor(message = 'Promotion has expired') {
    super('PROMOTION_EXPIRED', 409, message)
    Object.setPrototypeOf(this, PromotionExpiredError.prototype)
  }
}

export class PromotionUsageLimitExceededError extends AppError {
  constructor(message = 'Promotion usage limit has been exceeded') {
    super('PROMOTION_USAGE_LIMIT_EXCEEDED', 409, message)
    Object.setPrototypeOf(this, PromotionUsageLimitExceededError.prototype)
  }
}

export class InvalidCouponCodeError extends AppError {
  constructor(message = 'Invalid or expired coupon code') {
    super('INVALID_COUPON_CODE', 404, message)
    Object.setPrototypeOf(this, InvalidCouponCodeError.prototype)
  }
}
