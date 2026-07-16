import { env } from '@/shared/env'
import { AppError } from './app-error'

export function toErrorResponse(error: unknown): { code: string; message: string } {
  if (error instanceof AppError) {
    if (error.isOperational) {
      return { code: error.code, message: error.message }
    }
    if (env.NODE_ENV === 'production') {
      return {
        code: error.code,
        message: 'An internal error occurred',
      }
    }
    return { code: error.code, message: error.message }
  }

  if (env.NODE_ENV === 'production') {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal error occurred',
    }
  }

  const message = error instanceof Error ? error.message : String(error)
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message,
  }
}
