export interface ReportRange {
  from: Date
  to: Date
}

export type ReportGranularity = 'day' | 'week' | 'month'

export interface ReportFilter {
  branchId?: string
  shiftId?: string
  categoryId?: string
  productId?: string
}

// Sales reports
export interface SalesPeriodRow {
  period: string
  grossSales: number
  discounts: number
  tax: number
  netSales: number
  saleCount: number
}

export interface SalesBranchRow {
  branchId: string
  branchName: string
  grossSales: number
  discounts: number
  tax: number
  netSales: number
  saleCount: number
}

export interface SalesCashierRow {
  cashierUserId: string
  cashierName: string
  grossSales: number
  discounts: number
  tax: number
  netSales: number
  saleCount: number
}

export interface SalesCategoryRow {
  categoryId: string
  categoryName: string
  quantity: number
  grossSales: number
  discounts: number
  tax: number
  netSales: number
  saleCount: number
}

export interface SalesProductRow {
  variantId: string
  variantName: string
  sku: string
  quantity: number
  grossSales: number
  discounts: number
  tax: number
  netSales: number
  saleCount: number
}

// Margin report
export interface MarginRow {
  variantId: string
  variantName: string
  sku: string
  quantitySold: number
  revenue: number
  cogs?: number
  margin?: number
  marginPct?: number
  costUnavailable: boolean
}

// Tax report
export interface TaxRow {
  taxRate: number
  taxCollected: number
  taxableSales: number
}

// Payment method report
export interface PaymentMethodRow {
  method: string
  amount: number
  count: number
}

// Hourly heatmap
export interface HourlyHeatmapRow {
  dayOfWeek: number
  hour: number
  saleCount: number
  netSales: number
}
