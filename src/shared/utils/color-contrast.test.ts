import { describe, it, expect } from 'vitest'
import { hexToRgb, relativeLuminance, contrastRatio, meetsAA, meetsAAA } from './color-contrast'

describe('hexToRgb', () => {
  it('converts valid hex to RGB', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#CC785C')).toEqual({ r: 204, g: 120, b: 92 })
  })

  it('handles lowercase hex', () => {
    expect(hexToRgb('#cc785c')).toEqual({ r: 204, g: 120, b: 92 })
  })

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#zzz')).toBeNull()
    expect(hexToRgb('not-a-color')).toBeNull()
    expect(hexToRgb('#12345')).toBeNull()
  })
})

describe('contrastRatio', () => {
  it('calculates contrast for the base palette', () => {
    const ratio = contrastRatio('#20201C', '#F5F4EF')
    expect(ratio).not.toBeNull()
    expect(ratio!).toBeCloseTo(15, 0)
  })

  it('calculates contrast for accent/foreground pair', () => {
    const ratio = contrastRatio('#CC785C', '#20201C')
    expect(ratio).not.toBeNull()
    expect(ratio!).toBeCloseTo(5, 0)
  })

  it('calculates black/white as exactly 21:1', () => {
    const ratio = contrastRatio('#FFFFFF', '#000000')
    expect(ratio).toEqual(21)
  })

  it('is symmetric', () => {
    const ratio1 = contrastRatio('#20201C', '#F5F4EF')
    const ratio2 = contrastRatio('#F5F4EF', '#20201C')
    expect(ratio1).toEqual(ratio2)
  })

  it('returns null for invalid hex values', () => {
    expect(contrastRatio('#zzz', '#000000')).toBeNull()
    expect(contrastRatio('#FFFFFF', 'invalid')).toBeNull()
  })
})

describe('meetsAA', () => {
  it('passes for ratios >= 4.5 normal text', () => {
    expect(meetsAA(4.5)).toBe(true)
    expect(meetsAA(5)).toBe(true)
    expect(meetsAA(15.9)).toBe(true)
  })

  it('fails for ratios < 4.5 normal text', () => {
    expect(meetsAA(4)).toBe(false)
    expect(meetsAA(3)).toBe(false)
  })

  it('passes for ratios >= 3 large text', () => {
    expect(meetsAA(3, true)).toBe(true)
    expect(meetsAA(3.5, true)).toBe(true)
  })

  it('fails for ratios < 3 large text', () => {
    expect(meetsAA(2.9, true)).toBe(false)
  })

  it('returns false for null ratio', () => {
    expect(meetsAA(null)).toBe(false)
    expect(meetsAA(null, true)).toBe(false)
  })
})

describe('meetsAAA', () => {
  it('passes for ratios >= 7 normal text', () => {
    expect(meetsAAA(7)).toBe(true)
    expect(meetsAAA(15.9)).toBe(true)
  })

  it('fails for ratios < 7 normal text', () => {
    expect(meetsAAA(6.5)).toBe(false)
  })

  it('passes for ratios >= 4.5 large text', () => {
    expect(meetsAAA(4.5, true)).toBe(true)
  })

  it('fails for ratios < 4.5 large text', () => {
    expect(meetsAAA(4, true)).toBe(false)
  })
})
