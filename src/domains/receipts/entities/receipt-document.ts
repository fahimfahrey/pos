import type { TaxMode } from '@constants/enums'

export interface ReceiptTaxBreakdownLine {
  rate: number
  taxableAmount: number
  taxAmount: number
}

export interface ReceiptLineItem {
  name: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
}

export interface ReceiptPaymentLine {
  method: string
  amount: number
  tendered?: number
  changeDue?: number
}

export interface ReceiptDocument {
  receiptNumber: string
  issuedAt: Date
  org: {
    name: string
    logoUrl?: string
  }
  branch: {
    name: string
    address?: string
    taxRegistrationNumber?: string
  }
  lines: ReceiptLineItem[]
  subtotal: number
  discount: number
  taxMode: TaxMode
  taxBreakdown: ReceiptTaxBreakdownLine[]
  tax: number
  total: number
  payments: ReceiptPaymentLine[]
  changeDue: number
  footerText?: string
  showItemDescription: boolean
}
