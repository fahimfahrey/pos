import { AppError } from './app-error'

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', cause?: Error) {
    super('NOT_FOUND', 404, message, cause)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', cause?: Error) {
    super('VALIDATION_ERROR', 400, message, cause)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', cause?: Error) {
    super('CONFLICT', 409, message, cause)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', cause?: Error) {
    super('UNAUTHORIZED', 401, message, cause)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', cause?: Error) {
    super('FORBIDDEN', 403, message, cause)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}
