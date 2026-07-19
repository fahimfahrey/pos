import { AppError } from '@shared/errors'

export class InsufficientStoreCreditError extends AppError {
  constructor(message = 'Insufficient store credit for this transaction') {
    super('INSUFFICIENT_STORE_CREDIT', 409, message)
    Object.setPrototypeOf(this, InsufficientStoreCreditError.prototype)
  }
}
