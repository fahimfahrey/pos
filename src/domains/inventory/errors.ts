import { AppError } from '@shared/errors'

export class InsufficientStockError extends AppError {
  constructor(message = 'Insufficient stock for this movement') {
    super('INSUFFICIENT_STOCK', 409, message)
    Object.setPrototypeOf(this, InsufficientStockError.prototype)
  }
}
