import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ReceiptView } from './receipt-view'
import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'

describe('ReceiptView', () => {
  const baseDate = new Date('2024-01-01T12:00:00Z')

  describe('exclusive tax mode', () => {
    it('renders receipt with exclusive tax mode', () => {
      const document: ReceiptDocument = {
        receiptNumber: '100',
        issuedAt: baseDate,
        org: {
          name: 'Test Store',
          logoUrl: 'https://example.com/logo.png',
        },
        branch: {
          name: 'Downtown Branch',
          address: '123 Main Street',
          taxRegistrationNumber: 'TRN-123-456',
        },
        lines: [
          {
            name: 'Product A',
            sku: 'SKU-A',
            quantity: 2,
            unitPrice: 50.0,
            discount: 0,
            taxRate: 0.1,
            total: 110.0,
          },
          {
            name: 'Product B',
            sku: 'SKU-B',
            quantity: 1,
            unitPrice: 25.0,
            discount: 5.0,
            taxRate: 0.1,
            total: 22.0,
          },
        ],
        subtotal: 120.0,
        discount: 5.0,
        taxMode: 'exclusive',
        taxBreakdown: [
          {
            rate: 0.1,
            taxableAmount: 115.0,
            taxAmount: 11.5,
          },
        ],
        tax: 11.5,
        total: 126.5,
        payments: [
          {
            method: 'cash',
            amount: 126.5,
            tendered: 150.0,
            changeDue: 23.5,
          },
        ],
        changeDue: 23.5,
        footerText: 'Thank you for your purchase!',
        showItemDescription: true,
      }

      const { container } = render(<ReceiptView document={document} />)
      expect(container).toMatchSnapshot()
    })
  })

  describe('inclusive tax mode', () => {
    it('renders receipt with inclusive tax mode', () => {
      const document: ReceiptDocument = {
        receiptNumber: '101',
        issuedAt: baseDate,
        org: {
          name: 'Test Store',
          logoUrl: 'https://example.com/logo.png',
        },
        branch: {
          name: 'Downtown Branch',
          address: '123 Main Street',
          taxRegistrationNumber: 'TRN-123-456',
        },
        lines: [
          {
            name: 'Product A',
            sku: 'SKU-A',
            quantity: 2,
            unitPrice: 50.0,
            discount: 0,
            taxRate: 0.1,
            total: 110.0,
          },
          {
            name: 'Product B',
            sku: 'SKU-B',
            quantity: 1,
            unitPrice: 25.0,
            discount: 5.0,
            taxRate: 0.1,
            total: 22.0,
          },
        ],
        subtotal: 120.0,
        discount: 5.0,
        taxMode: 'inclusive',
        taxBreakdown: [
          {
            rate: 0.1,
            taxableAmount: 115.0,
            taxAmount: 11.5,
          },
        ],
        tax: 11.5,
        total: 126.5,
        payments: [
          {
            method: 'card',
            amount: 126.5,
          },
        ],
        changeDue: 0,
        footerText: 'Thank you for your purchase!',
        showItemDescription: true,
      }

      const { container } = render(<ReceiptView document={document} />)
      expect(container).toMatchSnapshot()
    })
  })

  it('renders receipt with minimal information', () => {
    const document: ReceiptDocument = {
      receiptNumber: '102',
      issuedAt: baseDate,
      org: {
        name: 'Simple Store',
      },
      branch: {
        name: 'Main',
      },
      lines: [
        {
          name: 'Item',
          sku: 'ITEM-1',
          quantity: 1,
          unitPrice: 10.0,
          discount: 0,
          taxRate: 0,
          total: 10.0,
        },
      ],
      subtotal: 10.0,
      discount: 0,
      taxMode: 'exclusive',
      taxBreakdown: [],
      tax: 0,
      total: 10.0,
      payments: [
        {
          method: 'cash',
          amount: 10.0,
        },
      ],
      changeDue: 0,
      showItemDescription: true,
    }

    const { container } = render(<ReceiptView document={document} />)
    expect(container).toMatchSnapshot()
  })
})
