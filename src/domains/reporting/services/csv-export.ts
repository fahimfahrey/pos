import type {
  SalesPeriodRow,
  SalesBranchRow,
  SalesCashierRow,
  SalesCategoryRow,
  SalesProductRow,
  MarginRow,
  TaxRow,
  PaymentMethodRow,
  HourlyHeatmapRow,
} from '../entities/report-rows'

export function rowsToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
): string {
  const lines: string[] = []

  // Header row
  lines.push(columns.map((c) => quoteField(c.header)).join(','))

  // Data rows
  for (const row of rows) {
    const values = columns.map((c) => {
      const value = row[c.key]
      if (value === undefined || value === null) return ''
      if (typeof value === 'number') return value.toString()
      if (typeof value === 'boolean') return value ? 'true' : 'false'
      if (value instanceof Date) return value.toISOString()
      return quoteField(String(value))
    })
    lines.push(values.join(','))
  }

  return lines.join('\n')
}

function quoteField(value: string): string {
  if (!value.includes(',') && !value.includes('"') && !value.includes('\n')) {
    return value
  }
  return '"' + value.replace(/"/g, '""') + '"'
}

const SALES_PERIOD_COLUMNS = [
  { key: 'period' as const, header: 'Period' },
  { key: 'grossSales' as const, header: 'Gross Sales' },
  { key: 'discounts' as const, header: 'Discounts' },
  { key: 'tax' as const, header: 'Tax' },
  { key: 'netSales' as const, header: 'Net Sales' },
  { key: 'saleCount' as const, header: 'Sale Count' },
]

const SALES_BRANCH_COLUMNS = [
  { key: 'branchId' as const, header: 'Branch ID' },
  { key: 'branchName' as const, header: 'Branch Name' },
  { key: 'grossSales' as const, header: 'Gross Sales' },
  { key: 'discounts' as const, header: 'Discounts' },
  { key: 'tax' as const, header: 'Tax' },
  { key: 'netSales' as const, header: 'Net Sales' },
  { key: 'saleCount' as const, header: 'Sale Count' },
]

const SALES_CASHIER_COLUMNS = [
  { key: 'cashierUserId' as const, header: 'Cashier ID' },
  { key: 'cashierName' as const, header: 'Cashier Name' },
  { key: 'grossSales' as const, header: 'Gross Sales' },
  { key: 'discounts' as const, header: 'Discounts' },
  { key: 'tax' as const, header: 'Tax' },
  { key: 'netSales' as const, header: 'Net Sales' },
  { key: 'saleCount' as const, header: 'Sale Count' },
]

const SALES_CATEGORY_COLUMNS = [
  { key: 'categoryId' as const, header: 'Category ID' },
  { key: 'categoryName' as const, header: 'Category' },
  { key: 'quantity' as const, header: 'Quantity' },
  { key: 'grossSales' as const, header: 'Gross Sales' },
  { key: 'discounts' as const, header: 'Discounts' },
  { key: 'tax' as const, header: 'Tax' },
  { key: 'netSales' as const, header: 'Net Sales' },
  { key: 'saleCount' as const, header: 'Sale Count' },
]

const SALES_PRODUCT_COLUMNS = [
  { key: 'variantId' as const, header: 'Variant ID' },
  { key: 'variantName' as const, header: 'Product' },
  { key: 'sku' as const, header: 'SKU' },
  { key: 'quantity' as const, header: 'Quantity Sold' },
  { key: 'grossSales' as const, header: 'Gross Sales' },
  { key: 'discounts' as const, header: 'Discounts' },
  { key: 'tax' as const, header: 'Tax' },
  { key: 'netSales' as const, header: 'Net Sales' },
  { key: 'saleCount' as const, header: 'Sale Count' },
]

const MARGIN_COLUMNS = [
  { key: 'variantId' as const, header: 'Variant ID' },
  { key: 'variantName' as const, header: 'Product' },
  { key: 'sku' as const, header: 'SKU' },
  { key: 'quantitySold' as const, header: 'Quantity Sold' },
  { key: 'revenue' as const, header: 'Revenue' },
  { key: 'cogs' as const, header: 'COGS' },
  { key: 'margin' as const, header: 'Margin' },
  { key: 'marginPct' as const, header: 'Margin %' },
  { key: 'costUnavailable' as const, header: 'Cost Unavailable' },
]

const TAX_COLUMNS = [
  { key: 'taxRate' as const, header: 'Tax Rate' },
  { key: 'taxCollected' as const, header: 'Tax Collected' },
  { key: 'taxableSales' as const, header: 'Taxable Sales' },
]

const PAYMENT_METHOD_COLUMNS = [
  { key: 'method' as const, header: 'Payment Method' },
  { key: 'amount' as const, header: 'Amount' },
  { key: 'count' as const, header: 'Transaction Count' },
]

const HOURLY_HEATMAP_COLUMNS = [
  { key: 'dayOfWeek' as const, header: 'Day of Week' },
  { key: 'hour' as const, header: 'Hour' },
  { key: 'saleCount' as const, header: 'Sale Count' },
  { key: 'netSales' as const, header: 'Net Sales' },
]

export function buildReportCsv(
  reportType:
    | 'sales_period'
    | 'sales_branch'
    | 'sales_cashier'
    | 'sales_category'
    | 'sales_product'
    | 'margin'
    | 'tax'
    | 'payment_method'
    | 'hourly_heatmap',
  rows: unknown[],
): string {
  switch (reportType) {
    case 'sales_period':
      return rowsToCsv(rows as SalesPeriodRow[], SALES_PERIOD_COLUMNS)
    case 'sales_branch':
      return rowsToCsv(rows as SalesBranchRow[], SALES_BRANCH_COLUMNS)
    case 'sales_cashier':
      return rowsToCsv(rows as SalesCashierRow[], SALES_CASHIER_COLUMNS)
    case 'sales_category':
      return rowsToCsv(rows as SalesCategoryRow[], SALES_CATEGORY_COLUMNS)
    case 'sales_product':
      return rowsToCsv(rows as SalesProductRow[], SALES_PRODUCT_COLUMNS)
    case 'margin':
      return rowsToCsv(rows as MarginRow[], MARGIN_COLUMNS)
    case 'tax':
      return rowsToCsv(rows as TaxRow[], TAX_COLUMNS)
    case 'payment_method':
      return rowsToCsv(rows as PaymentMethodRow[], PAYMENT_METHOD_COLUMNS)
    case 'hourly_heatmap':
      return rowsToCsv(rows as HourlyHeatmapRow[], HOURLY_HEATMAP_COLUMNS)
    default:
      const _exhaustive: never = reportType
      return _exhaustive
  }
}
