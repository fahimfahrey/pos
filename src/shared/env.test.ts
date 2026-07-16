import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('env', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('should use defaults when env vars are absent', async () => {
    vi.resetModules()
    const { env } = await import('./env')
    expect(env.LOG_LEVEL).toBe('info')
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('POS')
  })

  it('should parse valid env values', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('LOG_LEVEL', 'debug')
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'TestPOS')

    const { env } = await import('./env')
    expect(env.NODE_ENV).toBe('development')
    expect(env.LOG_LEVEL).toBe('debug')
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('TestPOS')
  })
})
