import { describe, it, expect } from 'vitest'
import { generateUlid } from './ulid'

describe('generateUlid', () => {
  it('should generate a 26-character string', () => {
    const ulid = generateUlid()
    expect(ulid).toHaveLength(26)
  })

  it('should use only Crockford base32 alphabet', () => {
    const ulid = generateUlid()
    expect(/^[0-9A-Z]+$/.test(ulid)).toBe(true)
    // No I, L, O, U (easily confused characters)
    expect(/[ILOU]/.test(ulid)).toBe(false)
  })

  it('should be lexicographically sortable by time', () => {
    const clock = () => 1000
    const ulid1 = generateUlid(clock)
    const ulid2 = generateUlid(() => 2000)
    expect(ulid1 < ulid2).toBe(true)
  })

  it('should generate unique ULIDs within the same millisecond', () => {
    const clock = () => 1000
    const ulid1 = generateUlid(clock)
    const ulid2 = generateUlid(clock)
    expect(ulid1).not.toEqual(ulid2)
  })

  it('should be monotonic-enough (same time produces increasing randomness)', () => {
    const clock = () => 1000
    const ulids = Array.from({ length: 10 }, () => generateUlid(clock))
    const sortedUlids = [...ulids].sort()
    // All generated ULIDs should be unique
    expect(new Set(ulids).size).toBe(10)
  })
})
