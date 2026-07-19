import { describe, it, expect } from 'vitest'
import { encodeReceipt } from './escpos-encoder'
import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'

describe('escpos-encoder', () => {
  const baseDocument: ReceiptDocument = {
    receiptNumber: '100',
    issuedAt: new Date('2024-01-01T12:00:00Z'),
    org: {
      name: 'Test Store',
      logoUrl: undefined,
    },
    branch: {
      name: 'Downtown',
      address: '123 Main St',
      taxRegistrationNumber: 'TRN-123',
    },
    lines: [
      {
        name: 'Widget',
        sku: 'WID-001',
        quantity: 2,
        unitPrice: 10.0,
        discount: 0,
        taxRate: 0.1,
        total: 22.0,
      },
    ],
    subtotal: 20.0,
    discount: 0,
    taxMode: 'exclusive',
    taxBreakdown: [
      {
        rate: 0.1,
        taxableAmount: 20.0,
        taxAmount: 2.0,
      },
    ],
    tax: 2.0,
    total: 22.0,
    payments: [
      {
        method: 'cash',
        amount: 22.0,
        tendered: 25.0,
        changeDue: 3.0,
      },
    ],
    changeDue: 3.0,
    footerText: 'Thank you!',
    showItemDescription: true,
  }

  it('encodes a receipt to Uint8Array', () => {
    const bytes = encodeReceipt(baseDocument)
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBeGreaterThan(0)
  })

  it('includes ESC/POS initialization bytes', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    // Check for initialization sequence
    expect(str).toContain('\x1B@')
  })

  it('includes cut command bytes', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    // Check for paper cut command (ESC/POS cut)
    expect(str).toContain('\x1DV')
  })

  it('includes org and branch information', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('Test Store')
    expect(str).toContain('Downtown')
    expect(str).toContain('123 Main St')
    expect(str).toContain('TRN-123')
  })

  it('includes line items', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('Widget')
    expect(str).toContain('WID-001')
  })

  it('includes financial totals', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('$20.00') // subtotal
    expect(str).toContain('$2.00') // tax
    expect(str).toContain('$22.00') // total
  })

  it('includes payment information', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('cash')
    expect(str).toContain('$3.00') // change
  })

  it('includes receipt number and timestamp', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('100')
  })

  it('includes footer text', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('Thank you!')
  })

  it('handles missing optional fields', () => {
    const docWithoutOptionals: ReceiptDocument = {
      ...baseDocument,
      org: { name: 'Store' },
      branch: { name: 'Branch' },
      footerText: undefined,
    }

    const bytes = encodeReceipt(docWithoutOptionals)
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBeGreaterThan(0)

    const str = new TextDecoder().decode(bytes)
    expect(str).toContain('Store')
    expect(str).toContain('Branch')
  })

  it('includes tax breakdown lines', () => {
    const bytes = encodeReceipt(baseDocument)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('10%')
    expect(str).toContain('$2.00')
  })

  it('handles multiple line items', () => {
    const docWithMultipleItems: ReceiptDocument = {
      ...baseDocument,
      lines: [
        {
          name: 'Item 1',
          sku: 'SKU-1',
          quantity: 1,
          unitPrice: 10.0,
          discount: 0,
          taxRate: 0.1,
          total: 11.0,
        },
        {
          name: 'Item 2',
          sku: 'SKU-2',
          quantity: 2,
          unitPrice: 5.0,
          discount: 0,
          taxRate: 0.1,
          total: 11.0,
        },
      ],
      subtotal: 20.0,
      tax: 2.0,
      total: 22.0,
    }

    const bytes = encodeReceipt(docWithMultipleItems)
    const str = new TextDecoder().decode(bytes)

    expect(str).toContain('Item 1')
    expect(str).toContain('Item 2')
    expect(str).toContain('SKU-1')
    expect(str).toContain('SKU-2')
  })
})
