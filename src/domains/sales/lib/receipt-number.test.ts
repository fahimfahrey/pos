import { describe, it, expect } from 'vitest'
import { formatReceiptNumber, parseReceiptNumber } from './receipt-number'

describe('receipt-number', () => {
  describe('formatReceiptNumber', () => {
    it('should format receipt number with zero padding', () => {
      const formatted = formatReceiptNumber('NYC', 1234)
      expect(formatted).toBe('NYC-00001234')
    })

    it('should handle single digit numbers', () => {
      const formatted = formatReceiptNumber('BOS', 5)
      expect(formatted).toBe('BOS-00000005')
    })

    it('should handle large numbers', () => {
      const formatted = formatReceiptNumber('LAX', 99999999)
      expect(formatted).toBe('LAX-99999999')
    })

    it('should handle branch code with hyphens', () => {
      const formatted = formatReceiptNumber('NYC-MAIN', 100)
      expect(formatted).toBe('NYC-MAIN-00000100')
    })

    it('should clamp negative numbers to zero', () => {
      const formatted = formatReceiptNumber('CHI', -5)
      expect(formatted).toBe('CHI-00000000')
    })

    it('should truncate float numbers', () => {
      const formatted = formatReceiptNumber('DEN', 1234.99)
      expect(formatted).toBe('DEN-00001234')
    })
  })

  describe('parseReceiptNumber', () => {
    it('should parse formatted receipt number', () => {
      const parsed = parseReceiptNumber('NYC-00001234')
      expect(parsed).toEqual({ branchCode: 'NYC', number: 1234 })
    })

    it('should parse receipt with multi-segment branch code', () => {
      const parsed = parseReceiptNumber('NYC-MAIN-00000100')
      expect(parsed).toEqual({ branchCode: 'NYC-MAIN', number: 100 })
    })

    it('should return null for invalid format', () => {
      const parsed = parseReceiptNumber('INVALID')
      expect(parsed).toBeNull()
    })

    it('should return null for missing number', () => {
      const parsed = parseReceiptNumber('NYC-')
      expect(parsed).toBeNull()
    })

    it('should handle leading zeros correctly', () => {
      const parsed = parseReceiptNumber('CHI-00000005')
      expect(parsed).toEqual({ branchCode: 'CHI', number: 5 })
    })
  })

  describe('round-trip', () => {
    it('should format and parse back to original values', () => {
      const branchCode = 'NYC'
      const number = 4567
      const formatted = formatReceiptNumber(branchCode, number)
      const parsed = parseReceiptNumber(formatted)
      expect(parsed).toEqual({ branchCode, number })
    })
  })
})
