import type { IdGenerator } from '@shared/ports/id-generator'

export class UuidIdGenerator implements IdGenerator {
  next(): string {
    return crypto.randomUUID()
  }
}
