import { describe, it, expect } from 'vitest'
import {
  calculateEan13Checksum,
  encodeEan13,
  validateEan13Checksum,
  encodeCode128,
} from './barcode-encoder'

describe('barcode-encoder', () => {
  describe('EAN-13', () => {
    it('calculates checksum correctly', () => {
      const checksum = calculateEan13Checksum('591274309122')
      expect(checksum).toBe('3')
    })

    it('encodes EAN-13 correctly', () => {
      const encoded = encodeEan13('591274309122')
      expect(encoded).toBe('5912743091223')
      expect(encoded.length).toBe(13)
    })

    it('validates correct EAN-13 checksum', () => {
      const valid = validateEan13Checksum('5912743091223')
      expect(valid).toBe(true)
    })

    it('rejects invalid EAN-13 checksum', () => {
      const invalid = validateEan13Checksum('5912743091224')
      expect(invalid).toBe(false)
    })

    it('rejects non-13-digit input', () => {
      const invalid = validateEan13Checksum('59127430912')
      expect(invalid).toBe(false)
    })

    it('throws on invalid input to encodeEan13', () => {
      expect(() => encodeEan13('abc')).toThrow()
      expect(() => encodeEan13('12345')).toThrow()
    })
  })

  describe('Code-128', () => {
    it('encodes text to bars', () => {
      const result = encodeCode128('TEST')
      expect(result.bars).toBeDefined()
      expect(Array.isArray(result.bars)).toBe(true)
      expect(result.text).toBe('TEST')
    })

    it('rejects non-ASCII characters', () => {
      expect(() => encodeCode128('TEST\x00')).toThrow()
    })

    it('encodes numbers correctly', () => {
      const result = encodeCode128('12345')
      expect(result.text).toBe('12345')
      expect(result.bars.length).toBeGreaterThan(0)
    })

    it('encodes mixed alphanumeric', () => {
      const result = encodeCode128('ABC123')
      expect(result.text).toBe('ABC123')
      expect(result.bars.length).toBeGreaterThan(0)
    })
  })
})
