import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from './app-error'
import { toErrorResponse } from './to-error-response'

describe('toErrorResponse', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should return code and message for operational errors', () => {
    const error = new AppError('TEST_ERROR', 400, 'Test message', undefined, true)
    const response = toErrorResponse(error)

    expect(response).toEqual({
      code: 'TEST_ERROR',
      message: 'Test message',
    })
  })

  it('should redact message for non-operational errors in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { toErrorResponse: toErrorResponseProd } = await import('./to-error-response')

    const error = new AppError(
      'INTERNAL_ERROR',
      500,
      'Sensitive internal details',
      undefined,
      false,
    )
    const response = toErrorResponseProd(error)

    expect(response.code).toBe('INTERNAL_SERVER_ERROR')
    expect(response.message).toBe('An internal error occurred')
  })

  it('should handle unknown errors', () => {
    const response = toErrorResponse(new Error('Unknown error'))
    expect(response.code).toBe('INTERNAL_SERVER_ERROR')
    expect(response.message).toBeTruthy()
  })
})
