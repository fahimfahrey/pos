import type { Sale } from '@domains/sales/entities/sale'
import type { SaleItem } from '@domains/sales/entities/sale-item'
import type { Payment } from '@domains/payments/entities/payment'
import type { Organization } from '@domains/organization/entities/organization'
import type { Branch } from '@domains/organization/entities/branch'
import type { ResolvedSettings } from '@domains/organization/entities/settings'
import type { ReceiptDocument } from '../entities/receipt-document'
import { formatReceiptNumber } from '@domains/sales/lib/receipt-number'

export interface BuildReceiptDocumentInput {
  sale: Sale
  items: SaleItem[]
  payments: Payment[]
  org: Organization
  branch: Branch
  settings: ResolvedSettings
}

export function buildReceiptDocument(input: BuildReceiptDocumentInput): ReceiptDocument {
  const { sale, items, payments, org, branch, settings } = input

  // Build line items
  const lines = items.map((item) => ({
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    taxRate: item.taxRate,
    total: item.total,
  }))

  // Build tax breakdown by rate
  const taxBreakdownMap = new Map<number, { taxableAmount: number; taxAmount: number }>()

  for (const item of items) {
    const existing = taxBreakdownMap.get(item.taxRate)
    if (existing) {
      existing.taxableAmount += item.subtotal
      existing.taxAmount += item.taxAmount
    } else {
      taxBreakdownMap.set(item.taxRate, {
        taxableAmount: item.subtotal,
        taxAmount: item.taxAmount,
      })
    }
  }

  const taxBreakdown = Array.from(taxBreakdownMap.entries()).map(([rate, breakdown]) => ({
    rate,
    taxableAmount: breakdown.taxableAmount,
    taxAmount: breakdown.taxAmount,
  }))

  // Build payment lines
  const paymentLines = payments.map((payment) => ({
    method: payment.method,
    amount: payment.amount,
    tendered: payment.tendered,
    changeDue: payment.changeDue,
  }))

  // Calculate total change due
  const changeDue = payments.reduce((sum, payment) => sum + (payment.changeDue ?? 0), 0)

  const document: ReceiptDocument = {
    receiptNumber: sale.receiptNumber
      ? formatReceiptNumber(org.name, sale.receiptNumber)
      : 'N/A',
    issuedAt: sale.createdAt,
    org: {
      name: org.name,
      logoUrl: org.logoUrl,
    },
    branch: {
      name: branch.name,
      address: branch.address,
      taxRegistrationNumber: branch.taxRegistrationNumber,
    },
    lines,
    subtotal: sale.subtotal,
    discount: sale.discount,
    taxMode: settings.taxMode,
    taxBreakdown,
    tax: sale.tax,
    total: sale.total,
    payments: paymentLines,
    changeDue,
    footerText: settings.receiptTemplate.footerText,
    showItemDescription: settings.receiptTemplate.showItemDescription,
  }

  return document
}
