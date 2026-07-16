export class AppError extends Error {
  code: string
  httpStatus: number
  override cause?: Error
  isOperational: boolean

  constructor(
    code: string,
    httpStatus: number,
    message: string,
    cause?: Error,
    isOperational: boolean = true,
  ) {
    super(message)
    this.code = code
    this.httpStatus = httpStatus
    this.cause = cause
    this.isOperational = isOperational
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
