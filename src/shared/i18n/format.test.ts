import { createFormatters } from './format'

describe('createFormatters', () => {
  it('formats money in en-US with Latin digits', () => {
    const { money } = createFormatters('en-US', { timezone: 'UTC', currency: 'USD' })
    expect(money(1050)).toBe('$10.50')
  })

  it('formats money in bn-BD using the BDT symbol, Latin digits by default', () => {
    const { money } = createFormatters('bn-BD', { timezone: 'UTC', currency: 'BDT' })
    expect(money(1050)).toContain('10.50')
    expect(money(1050)).toContain('৳')
  })

  it('renders native Bengali digits when the tenant prefers them', () => {
    const { number } = createFormatters('bn-BD', { timezone: 'UTC', currency: 'BDT', useNativeDigits: true })
    // ০১২৩৪৫৬৭৮৯ — Bengali numbering system digits
    expect(number(1234)).toBe('১,২৩৪')
  })

  it('keeps Latin digits for bn-BD when the tenant has not opted into native digits', () => {
    const { number } = createFormatters('bn-BD', { timezone: 'UTC', currency: 'BDT', useNativeDigits: false })
    expect(number(1234)).toBe('1,234')
  })

  it('formats dates in the tenant timezone, not the host timezone', () => {
    const { date } = createFormatters('en-US', { timezone: 'Asia/Dhaka', currency: 'USD' })
    // 2026-01-01T00:30:00Z is 2026-01-01T06:30 in Asia/Dhaka (UTC+6)
    const formatted = date('2026-01-01T00:30:00Z', { hour: 'numeric', minute: '2-digit', hour12: true })
    expect(formatted).toMatch(/6:30/)
  })

  it('never mixes numbering system extension into a locale that has none configured', () => {
    const { number } = createFormatters('en-US', { timezone: 'UTC', currency: 'USD', useNativeDigits: true })
    expect(number(1234)).toBe('1,234')
  })
})
