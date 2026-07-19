import { describe, it, expect } from 'vitest'
import { buildReceiptDocument } from './receipt-builder'
import type { Sale } from '@domains/sales/entities/sale'
import type { SaleItem } from '@domains/sales/entities/sale-item'
import type { Payment } from '@domains/payments/entities/payment'
import type { Organization } from '@domains/organization/entities/organization'
import type { Branch } from '@domains/organization/entities/branch'
import type { ResolvedSettings } from '@domains/organization/entities/settings'

describe('receipt-builder', () => {
  const baseDate = new Date('2024-01-01T12:00:00Z')

  const org: Organization = {
    id: 'org-1',
    name: 'Test Org',
    plan: 'professional',
    status: 'active',
    settings: {},
    logoUrl: 'https://example.com/logo.png',
    createdAt: baseDate,
    updatedAt: baseDate,
  }

  const branch: Branch = {
    id: 'branch-1',
    orgId: 'org-1',
    name: 'Downtown',
    address: '123 Main St',
    taxRegistrationNumber: 'TRN-12345',
    settings: {},
    active: true,
    createdAt: baseDate,
    updatedAt: baseDate,
  }

  const settingsExclusive: ResolvedSettings = {
    currency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    taxMode: 'exclusive',
    taxRules: [],
    receiptTemplate: {
      headerText: 'Welcome',
      footerText: 'Thank you!',
      showItemDescription: true,
      showTaxBreakdown: true,
    },
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
    discountLimits: { cashierMaxPercent: 10, cashierMaxFixedAmount: 20 },
    inventory: { allowOversell: false },
  }

  const settingsInclusive: ResolvedSettings = {
    ...settingsExclusive,
    taxMode: 'inclusive',
  }

  it('builds a complete receipt document with exclusive tax', () => {
    const sale: Sale = {
      id: 'sale-1',
      orgId: 'org-1',
      branchId: 'branch-1',
      shiftId: 'shift-1',
      status: 'paid',
      receiptNumber: 100,
      subtotal: 100.0,
      discount: 10.0,
      tax: 16.2,
      total: 106.2,
      createdAt: baseDate,
      createdBy: 'cashier-1',
    }

    const items: SaleItem[] = [
      {
        id: 'item-1',
        saleId: 'sale-1',
        variantId: 'var-1',
        quantity: 2,
        unitPrice: 50.0,
        discount: 0,
        taxRate: 0.1,
        taxAmount: 10.0,
        subtotal: 100.0,
        total: 110.0,
        name: 'Product A',
        sku: 'SKU-A',
        createdAt: baseDate,
      },
    ]

    const payments: Payment[] = [
      {
        id: 'pay-1',
        saleId: 'sale-1',
        amount: 106.2,
        currency: 'USD',
        method: 'cash',
        status: 'completed',
        gateway: 'cash-gateway',
        idempotencyKey: 'key-1',
        tendered: 110.0,
        changeDue: 3.8,
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    ]

    const doc = buildReceiptDocument({
      sale,
      items,
      payments,
      org,
      branch,
      settings: settingsExclusive,
    })

    expect(doc.receiptNumber).toBe('Test Org 100')
    expect(doc.issuedAt).toEqual(baseDate)
    expect(doc.org.name).toBe('Test Org')
    expect(doc.org.logoUrl).toBe('https://example.com/logo.png')
    expect(doc.branch.name).toBe('Downtown')
    expect(doc.branch.address).toBe('123 Main St')
    expect(doc.branch.taxRegistrationNumber).toBe('TRN-12345')
    expect(doc.lines).toHaveLength(1)
    expect(doc.lines[0].name).toBe('Product A')
    expect(doc.lines[0].quantity).toBe(2)
    expect(doc.taxMode).toBe('exclusive')
    expect(doc.taxBreakdown).toHaveLength(1)
    expect(doc.taxBreakdown[0].rate).toBe(0.1)
    expect(doc.taxBreakdown[0].taxAmount).toBe(10.0)
    expect(doc.subtotal).toBe(100.0)
    expect(doc.tax).toBe(16.2)
    expect(doc.total).toBe(106.2)
    expect(doc.changeDue).toBe(3.8)
    expect(doc.payments).toHaveLength(1)
    expect(doc.payments[0].method).toBe('cash')
    expect(doc.payments[0].changeDue).toBe(3.8)
    expect(doc.footerText).toBe('Thank you!')
  })

  it('builds a complete receipt document with inclusive tax', () => {
    const sale: Sale = {
      id: 'sale-2',
      orgId: 'org-1',
      branchId: 'branch-1',
      shiftId: 'shift-1',
      status: 'paid',
      receiptNumber: 101,
      subtotal: 100.0,
      discount: 0,
      tax: 16.2,
      total: 116.2,
      createdAt: baseDate,
      createdBy: 'cashier-1',
    }

    const items: SaleItem[] = [
      {
        id: 'item-2',
        saleId: 'sale-2',
        variantId: 'var-2',
        quantity: 1,
        unitPrice: 100.0,
        discount: 0,
        taxRate: 0.1,
        taxAmount: 9.09,
        subtotal: 100.0,
        total: 109.09,
        name: 'Product B',
        sku: 'SKU-B',
        createdAt: baseDate,
      },
    ]

    const payments: Payment[] = [
      {
        id: 'pay-2',
        saleId: 'sale-2',
        amount: 116.2,
        currency: 'USD',
        method: 'card',
        status: 'completed',
        gateway: 'stripe',
        idempotencyKey: 'key-2',
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    ]

    const doc = buildReceiptDocument({
      sale,
      items,
      payments,
      org,
      branch,
      settings: settingsInclusive,
    })

    expect(doc.taxMode).toBe('inclusive')
    expect(doc.total).toBe(116.2)
  })

  it('handles missing optional fields gracefully', () => {
    const orgNoLogo = { ...org, logoUrl: undefined }
    const branchNoAddress = { ...branch, address: undefined, taxRegistrationNumber: undefined }

    const sale: Sale = {
      id: 'sale-3',
      orgId: 'org-1',
      branchId: 'branch-1',
      shiftId: 'shift-1',
      status: 'paid',
      receiptNumber: undefined,
      subtotal: 50.0,
      discount: 0,
      tax: 5.0,
      total: 55.0,
      createdAt: baseDate,
      createdBy: 'cashier-1',
    }

    const items: SaleItem[] = []
    const payments: Payment[] = []

    const doc = buildReceiptDocument({
      sale,
      items,
      payments,
      org: orgNoLogo,
      branch: branchNoAddress,
      settings: settingsExclusive,
    })

    expect(doc.org.logoUrl).toBeUndefined()
    expect(doc.branch.address).toBeUndefined()
    expect(doc.branch.taxRegistrationNumber).toBeUndefined()
    expect(doc.receiptNumber).toBe('N/A')
    expect(doc.lines).toHaveLength(0)
    expect(doc.taxBreakdown).toHaveLength(0)
  })

  it('aggregates tax breakdown by rate across multiple items', () => {
    const sale: Sale = {
      id: 'sale-4',
      orgId: 'org-1',
      branchId: 'branch-1',
      shiftId: 'shift-1',
      status: 'paid',
      receiptNumber: 102,
      subtotal: 200.0,
      discount: 0,
      tax: 25.0,
      total: 225.0,
      createdAt: baseDate,
      createdBy: 'cashier-1',
    }

    const items: SaleItem[] = [
      {
        id: 'item-3',
        saleId: 'sale-4',
        variantId: 'var-3',
        quantity: 1,
        unitPrice: 100.0,
        discount: 0,
        taxRate: 0.1,
        taxAmount: 10.0,
        subtotal: 100.0,
        total: 110.0,
        name: 'Product C (10% tax)',
        sku: 'SKU-C',
        createdAt: baseDate,
      },
      {
        id: 'item-4',
        saleId: 'sale-4',
        variantId: 'var-4',
        quantity: 1,
        unitPrice: 100.0,
        discount: 0,
        taxRate: 0.15,
        taxAmount: 15.0,
        subtotal: 100.0,
        total: 115.0,
        name: 'Product D (15% tax)',
        sku: 'SKU-D',
        createdAt: baseDate,
      },
    ]

    const payments: Payment[] = []

    const doc = buildReceiptDocument({
      sale,
      items,
      payments,
      org,
      branch,
      settings: settingsExclusive,
    })

    expect(doc.taxBreakdown).toHaveLength(2)
    const breakdown10 = doc.taxBreakdown.find((b) => b.rate === 0.1)
    const breakdown15 = doc.taxBreakdown.find((b) => b.rate === 0.15)

    expect(breakdown10).toEqual({
      rate: 0.1,
      taxableAmount: 100.0,
      taxAmount: 10.0,
    })

    expect(breakdown15).toEqual({
      rate: 0.15,
      taxableAmount: 100.0,
      taxAmount: 15.0,
    })
  })
})
