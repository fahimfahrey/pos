import type { Clock } from '@shared/ports/clock'

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}
