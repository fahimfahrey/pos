import type { RateLimiter, RateLimitResult } from '@shared/ports/rate-limiter'

interface RateLimitEntry {
  count: number
  windowStart: number
  blockedUntil: number
}

export class InMemoryRateLimiter implements RateLimiter {
  private entries = new Map<string, RateLimitEntry>()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly lockoutMs: number

  constructor(options?: {
    maxAttempts?: number
    windowMinutes?: number
    lockoutMinutes?: number
  }) {
    this.maxAttempts = options?.maxAttempts ?? 5
    this.windowMs = (options?.windowMinutes ?? 15) * 60 * 1000
    this.lockoutMs = (options?.lockoutMinutes ?? 15) * 60 * 1000
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    let entry = this.entries.get(key)

    if (!entry) {
      entry = { count: 0, windowStart: now, blockedUntil: 0 }
      this.entries.set(key, entry)
    }

    // Check if still in lockout
    if (entry.blockedUntil > now) {
      const retryAfterMs = entry.blockedUntil - now
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs,
      }
    }

    // Reset window if expired
    if (now - entry.windowStart > this.windowMs) {
      entry.count = 0
      entry.windowStart = now
    }

    // Increment counter
    entry.count++

    // Check if exceeded
    if (entry.count > this.maxAttempts) {
      entry.blockedUntil = now + this.lockoutMs
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: this.lockoutMs,
      }
    }

    return {
      allowed: true,
      remaining: this.maxAttempts - entry.count,
      retryAfterMs: 0,
    }
  }

  async reset(key: string): Promise<void> {
    this.entries.delete(key)
  }
}
