import type { PaymentMethodRow } from './report-rows'

export interface ZReport {
  id: string
  orgId: string
  branchId: string
  shiftId: string
  registerId: string
  cashierUserId: string
  openedAt: Date
  closedAt: Date
  openingFloat: number
  cashSales: number
  nonCashSales: number
  expectedCashAmount: number
  countedCashAmount: number
  discrepancy: number
  grossSales: number
  discounts: number
  taxCollected: number
  netSales: number
  refunds: number
  saleCount: number
  paymentMethodBreakdown: PaymentMethodRow[]
  generatedAt: Date
  generatedBy: string
}
