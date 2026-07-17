import { describe, it, expect } from 'vitest'
import { resolveSettings, resolveSettingsFrom } from './settings-resolver'
import { DEFAULT_SETTINGS } from '../entities/settings'

describe('settingsResolver', () => {
  it('returns DEFAULT_SETTINGS when org and branch have no settings', () => {
    const resolved = resolveSettings({ settings: {} })
    expect(resolved).toEqual(DEFAULT_SETTINGS)
  })

  it('org settings override defaults', () => {
    const org = { settings: { currency: 'EUR' } }
    const resolved = resolveSettings(org)
    expect(resolved.currency).toBe('EUR')
    expect(resolved.locale).toBe(DEFAULT_SETTINGS.locale)
  })

  it('branch settings override org settings', () => {
    const org = { settings: { currency: 'EUR', locale: 'fr-FR' } }
    const branch = { settings: { currency: 'GBP' } }
    const resolved = resolveSettings(org, branch)
    expect(resolved.currency).toBe('GBP')
    expect(resolved.locale).toBe('fr-FR')
  })

  it('handles undefined branch gracefully', () => {
    const org = { settings: { currency: 'EUR' } }
    const resolved = resolveSettings(org, undefined)
    expect(resolved.currency).toBe('EUR')
  })

  it('handles null branch gracefully', () => {
    const org = { settings: { currency: 'EUR' } }
    const resolved = resolveSettings(org, null)
    expect(resolved.currency).toBe('EUR')
  })

  it('precedence: defaults -> org -> branch', () => {
    const org = { settings: { currency: 'EUR', locale: 'de-DE' } }
    const branch = { settings: { locale: 'en-GB' } }
    const resolved = resolveSettings(org, branch)
    expect(resolved.currency).toBe('EUR')
    expect(resolved.locale).toBe('en-GB')
    expect(resolved.timezone).toBe(DEFAULT_SETTINGS.timezone)
  })

  it('shallow merge: branch taxRules replaces org taxRules', () => {
    const orgTaxRules = [{ id: '1', name: 'VAT', rate: 0.2, taxMode: 'inclusive' as const }]
    const branchTaxRules = [{ id: '2', name: 'GST', rate: 0.1, taxMode: 'inclusive' as const }]
    const org = { settings: { taxRules: orgTaxRules } }
    const branch = { settings: { taxRules: branchTaxRules } }
    const resolved = resolveSettings(org, branch)
    expect(resolved.taxRules).toBe(branchTaxRules)
    expect(resolved.taxRules).not.toContain(orgTaxRules[0])
  })

  it('resolveSettingsFrom overload works the same way', () => {
    const resolved = resolveSettingsFrom(
      { currency: 'EUR' },
      { locale: 'de-DE' },
    )
    expect(resolved.currency).toBe('EUR')
    expect(resolved.locale).toBe('de-DE')
    expect(resolved.timezone).toBe(DEFAULT_SETTINGS.timezone)
  })

  it('resolveSettingsFrom with null branch settings', () => {
    const resolved = resolveSettingsFrom({ currency: 'EUR' }, null)
    expect(resolved.currency).toBe('EUR')
  })

  it('all top-level keys present in resolved settings', () => {
    const resolved = resolveSettings({ settings: {} })
    expect(resolved).toHaveProperty('currency')
    expect(resolved).toHaveProperty('locale')
    expect(resolved).toHaveProperty('timezone')
    expect(resolved).toHaveProperty('taxMode')
    expect(resolved).toHaveProperty('taxRules')
    expect(resolved).toHaveProperty('receiptTemplate')
    expect(resolved).toHaveProperty('rounding')
    expect(resolved).toHaveProperty('businessHours')
    expect(resolved).toHaveProperty('barcodeSymbology')
    expect(resolved).toHaveProperty('loyalty')
  })
})
