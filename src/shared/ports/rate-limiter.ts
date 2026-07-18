export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>
  reset(key: string): Promise<void>
}
