import { pseudoLocalize, pseudoLocalizeCatalog } from './pseudo-localize'

describe('pseudoLocalize', () => {
  it('brackets the output so truncation is visible at a glance', () => {
    const result = pseudoLocalize('Cancel')
    expect(result.startsWith('[')).toBe(true)
    expect(result.endsWith(']')).toBe(true)
  })

  it('replaces every Latin letter with an accented look-alike', () => {
    const result = pseudoLocalize('Cancel')
    expect(result).not.toMatch(/[A-Za-z]/)
  })

  it('preserves interpolation placeholders untouched', () => {
    const result = pseudoLocalize('Welcome, {name}')
    expect(result).toContain('{name}')
  })

  it('pads length to simulate translation expansion', () => {
    const source = 'Void Sale'
    const result = pseudoLocalize(source, 0.4)
    // brackets + accented source + padding must exceed the original length
    expect(result.length).toBeGreaterThan(source.length)
  })

  it('is deterministic for the same input', () => {
    expect(pseudoLocalize('Approve')).toBe(pseudoLocalize('Approve'))
  })
})

describe('pseudoLocalizeCatalog', () => {
  it('walks nested message trees and pseudo-localizes every leaf string', () => {
    const catalog = {
      checkout: {
        voidSale: {
          title: 'Void Sale',
          reasons: { other: 'Other' },
        },
      },
    }

    const result = pseudoLocalizeCatalog(catalog) as typeof catalog
    expect(result.checkout.voidSale.title).not.toBe('Void Sale')
    expect(result.checkout.voidSale.title.startsWith('[')).toBe(true)
    expect(result.checkout.voidSale.reasons.other).not.toBe('Other')
  })

  it('leaves the structure shape intact', () => {
    const catalog = { a: { b: { c: 'text' } } }
    const result = pseudoLocalizeCatalog(catalog) as typeof catalog
    expect(typeof result.a.b.c).toBe('string')
  })
})
