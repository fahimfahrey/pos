import { describe, it, expect } from 'vitest'
import { resolveTaxRate } from './tax-resolver'
import type { Category } from '@domains/catalog/entities/category'
import type { ResolvedSettings } from '@domains/organization/entities/settings'

describe('tax-resolver', () => {
  const settings: ResolvedSettings = {
    currency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    taxMode: 'exclusive',
    taxRules: [
      { id: 'default', name: 'Default', rate: 8, taxMode: 'exclusive' },
      { id: 'reduced', name: 'Reduced', rate: 5, taxMode: 'exclusive' },
      { id: 'zero', name: 'Zero', rate: 0, taxMode: 'exclusive' },
    ],
    receiptTemplate: { showItemDescription: true, showTaxBreakdown: true },
    rounding: { mode: 'nearest', increment: 0.01 },
    businessHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { isClosed: true, open: '', close: '' },
    },
    barcodeSymbology: 'ean13',
    loyalty: { enabled: false },
    security: {
      sessionTimeoutMinutes: 480,
      pinReauthTimeoutMinutes: 15,
      maxAuthAttempts: 5,
      authWindowMinutes: 15,
    },
    inventory: { allowOversell: false },
    discountLimits: { cashierMaxPercent: 10, cashierMaxFixedAmount: 20 },
  }

  it('should resolve tax rate for category with explicit taxRuleId', () => {
    const category: Category = {
      id: 'cat1',
      orgId: 'org1',
      name: 'Books',
      taxRuleId: 'reduced',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const rate = resolveTaxRate(settings, category)
    expect(rate).toBe(5)
  })

  it('should fall back to default rule when category has no taxRuleId', () => {
    const category: Category = {
      id: 'cat1',
      orgId: 'org1',
      name: 'General',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const rate = resolveTaxRate(settings, category)
    expect(rate).toBe(8)
  })

  it('should fall back to default when taxRuleId is not found', () => {
    const category: Category = {
      id: 'cat1',
      orgId: 'org1',
      name: 'Electronics',
      taxRuleId: 'nonexistent',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const rate = resolveTaxRate(settings, category)
    expect(rate).toBe(8)
  })

  it('should return 0 when category is null and no tax rules', () => {
    const emptySettings: ResolvedSettings = { ...settings, taxRules: [] }
    const rate = resolveTaxRate(emptySettings, null)
    expect(rate).toBe(0)
  })

  it('should return 0 rate from default rule when available', () => {
    const zeroSettings: ResolvedSettings = {
      ...settings,
      taxRules: [{ id: 'zero', name: 'Zero Rate', rate: 0, taxMode: 'exclusive' }],
    }

    const category: Category = {
      id: 'cat1',
      orgId: 'org1',
      name: 'Exempt',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const rate = resolveTaxRate(zeroSettings, category)
    expect(rate).toBe(0)
  })
})
