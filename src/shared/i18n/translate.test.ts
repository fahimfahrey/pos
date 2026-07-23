import { createTranslator } from './translate'
import { pseudoLocalizeCatalog } from './pseudo-localize'
import { getAllCatalogs } from './translate'

describe('createTranslator', () => {
  it('resolves nested keys from the real en-US catalog', () => {
    const t = createTranslator('en-US')
    expect(t('checkout.voidSale.title')).toBe('Void Sale')
  })

  it('resolves nested keys from the real bn-BD catalog', () => {
    const t = createTranslator('bn-BD')
    expect(t('checkout.voidSale.title')).toBe('বিক্রয় বাতিল করুন')
  })

  it('interpolates {placeholder} variables', () => {
    const t = createTranslator('en-US')
    expect(t('checkout.openShift.welcome', { name: 'Alex' })).toBe('Welcome, Alex')
  })

  it('selects the plural category via Intl.PluralRules', () => {
    const t = createTranslator('en-US')
    expect(t('checkout.holdResume.itemsCount', { count: 1 }, 1)).toBe('1 item')
    expect(t('checkout.holdResume.itemsCount', { count: 3 }, 3)).toBe('3 items')
  })

  it('falls back to en-US when a key is missing from the active catalog', () => {
    const t = createTranslator('bn-BD', { checkout: {} })
    expect(t('checkout.voidSale.title')).toBe('Void Sale')
  })

  it('returns the raw key when a key is missing everywhere (visible failure, not silent blank)', () => {
    const t = createTranslator('en-US')
    expect(t('checkout.does.not.exist')).toBe('checkout.does.not.exist')
  })

  it('accepts a catalogOverride for pseudo-localization tests', () => {
    const pseudo = pseudoLocalizeCatalog(getAllCatalogs()['en-US'])
    const t = createTranslator('en-US', pseudo)
    expect(t('checkout.voidSale.title')).not.toBe('Void Sale')
    expect(t('checkout.voidSale.title').startsWith('[')).toBe(true)
  })
})

describe('message catalog parity', () => {
  function collectKeys(node: unknown, prefix = ''): string[] {
    if (typeof node === 'string') return [prefix]
    if (node && typeof node === 'object') {
      return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
        collectKeys(value, prefix ? `${prefix}.${key}` : key)
      )
    }
    return []
  }

  it('en-US and bn-BD expose exactly the same set of keys', () => {
    const catalogs = getAllCatalogs()
    const enKeys = collectKeys(catalogs['en-US']).sort()
    const bnKeys = collectKeys(catalogs['bn-BD']).sort()
    expect(bnKeys).toEqual(enKeys)
  })
})
