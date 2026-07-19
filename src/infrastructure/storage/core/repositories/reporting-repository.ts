// eslint-disable-next-line boundaries/no-unknown
import type { ReportingRepository } from '@domains/reporting/repository'
import type {
  ReportRange,
  ReportGranularity,
  ReportFilter,
  SalesPeriodRow,
  SalesBranchRow,
  SalesCashierRow,
  SalesCategoryRow,
  SalesProductRow,
  MarginRow,
  TaxRow,
  PaymentMethodRow,
  HourlyHeatmapRow,
} from '@domains/reporting/entities/report-rows'
// eslint-disable-next-line boundaries/no-unknown
import type { ZReport } from '@domains/reporting/entities/z-report'
// eslint-disable-next-line boundaries/no-unknown
import type { Sale } from '@domains/sales/entities/sale'
// eslint-disable-next-line boundaries/no-unknown
import type { SaleItem } from '@domains/sales/entities/sale-item'
// eslint-disable-next-line boundaries/no-unknown
import type { Payment } from '@domains/payments/entities/payment'
// eslint-disable-next-line boundaries/no-unknown
import type { Category } from '@domains/catalog/entities/category'
// eslint-disable-next-line boundaries/no-unknown
import type { CatalogProduct } from '@domains/catalog/entities/product'
// eslint-disable-next-line boundaries/no-unknown
import type { ProductVariant } from '@domains/catalog/entities/product-variant'
// eslint-disable-next-line boundaries/no-unknown
import type { StockMovement } from '@domains/inventory/entities/stock-movement'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreReportingRepository implements ReportingRepository {
  private salesCollection: Collection<Sale>
  private saleItemsCollection: Collection<SaleItem>
  private paymentsCollection: Collection<Payment>
  private categoriesCollection: Collection<Category>
  private catalogProductsCollection: Collection<CatalogProduct>
  private catalogProductVariantsCollection: Collection<ProductVariant>
  private stockMovementsCollection: Collection<StockMovement>
  private zReportsCollection: Collection<ZReport>

  constructor(tx: DriverTransaction) {
    this.salesCollection = new Collection<Sale>(tx, 'sales')
    this.saleItemsCollection = new Collection<SaleItem>(tx, 'saleItems')
    this.paymentsCollection = new Collection<Payment>(tx, 'payments')
    this.categoriesCollection = new Collection<Category>(tx, 'categories')
    this.catalogProductsCollection = new Collection<CatalogProduct>(tx, 'catalogProducts')
    this.catalogProductVariantsCollection = new Collection<ProductVariant>(tx, 'catalogProductVariants')
    this.stockMovementsCollection = new Collection<StockMovement>(tx, 'stockMovements')
    this.zReportsCollection = new Collection<ZReport>(tx, 'zReports')
  }

  private async selectScopedSales(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<Sale[]> {
    const allSales = await this.salesCollection.filter(
      (s) =>
        s.orgId === orgId &&
        s.createdAt >= range.from &&
        s.createdAt <= range.to &&
        (!filter?.branchId || s.branchId === filter.branchId) &&
        (!filter?.shiftId || s.shiftId === filter.shiftId),
    )
    return allSales
  }

  async sumSalesByPeriod(
    orgId: string,
    range: ReportRange,
    granularity: ReportGranularity,
    timezone: string,
    filter?: ReportFilter,
  ): Promise<SalesPeriodRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)

    const grouped = new Map<string, SalesPeriodRow>()

    for (const sale of sales) {
      const periodKey = this.getPeriodBucket(sale.createdAt, granularity, timezone)

      const existing = grouped.get(periodKey)
      if (existing) {
        existing.grossSales += sale.subtotal
        existing.discounts += sale.discount
        existing.tax += sale.tax
        existing.netSales += sale.total
        existing.saleCount += 1
      } else {
        grouped.set(periodKey, {
          period: periodKey,
          grossSales: sale.subtotal,
          discounts: sale.discount,
          tax: sale.tax,
          netSales: sale.total,
          saleCount: 1,
        })
      }
    }

    return Array.from(grouped.values())
  }

  async sumSalesByBranch(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesBranchRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)

    const grouped = new Map<string, SalesBranchRow>()

    for (const sale of sales) {
      const existing = grouped.get(sale.branchId)
      if (existing) {
        existing.grossSales += sale.subtotal
        existing.discounts += sale.discount
        existing.tax += sale.tax
        existing.netSales += sale.total
        existing.saleCount += 1
      } else {
        grouped.set(sale.branchId, {
          branchId: sale.branchId,
          branchName: '', // Will be populated from branch data if needed
          grossSales: sale.subtotal,
          discounts: sale.discount,
          tax: sale.tax,
          netSales: sale.total,
          saleCount: 1,
        })
      }
    }

    return Array.from(grouped.values())
  }

  async sumSalesByCashier(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesCashierRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)

    const grouped = new Map<string, SalesCashierRow>()

    for (const sale of sales) {
      const cashierId = sale.createdBy || 'unknown'
      const existing = grouped.get(cashierId)
      if (existing) {
        existing.grossSales += sale.subtotal
        existing.discounts += sale.discount
        existing.tax += sale.tax
        existing.netSales += sale.total
        existing.saleCount += 1
      } else {
        grouped.set(cashierId, {
          cashierUserId: cashierId,
          cashierName: '', // Will be populated from user data if needed
          grossSales: sale.subtotal,
          discounts: sale.discount,
          tax: sale.tax,
          netSales: sale.total,
          saleCount: 1,
        })
      }
    }

    return Array.from(grouped.values())
  }

  async sumSalesByCategory(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesCategoryRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)
    const saleIds = new Set(sales.map((s) => s.id))

    const items = await this.saleItemsCollection.filter((i) => saleIds.has(i.saleId))
    const categories = await this.categoriesCollection.filter((c) => c.orgId === orgId)
    const variants = await this.catalogProductVariantsCollection.filter((v) => v.orgId === orgId)
    const products = await this.catalogProductsCollection.filter((p) => p.orgId === orgId)

    const variantMap = new Map(variants.map((v) => [v.id, v]))
    const productMap = new Map(products.map((p) => [p.id, p]))
    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    const grouped = new Map<string, SalesCategoryRow>()

    for (const item of items) {
      const variant = variantMap.get(item.variantId)
      if (!variant) continue

      const product = productMap.get(variant.productId)
      if (!product) continue

      const category = categoryMap.get(product.categoryId)
      if (!category) continue

      const existing = grouped.get(category.id)
      if (existing) {
        existing.quantity += item.quantity
        existing.grossSales += item.subtotal
        existing.discounts += item.discount
        existing.tax += item.taxAmount
        existing.netSales += item.total
        existing.saleCount += 1
      } else {
        grouped.set(category.id, {
          categoryId: category.id,
          categoryName: category.name,
          quantity: item.quantity,
          grossSales: item.subtotal,
          discounts: item.discount,
          tax: item.taxAmount,
          netSales: item.total,
          saleCount: 1,
        })
      }
    }

    return Array.from(grouped.values())
  }

  async sumSalesByProduct(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesProductRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)
    const saleIds = new Set(sales.map((s) => s.id))

    const items = await this.saleItemsCollection.filter((i) => saleIds.has(i.saleId))
    const variants = await this.catalogProductVariantsCollection.filter((v) => v.orgId === orgId)

    const variantMap = new Map(variants.map((v) => [v.id, v]))

    const grouped = new Map<string, SalesProductRow>()

    for (const item of items) {
      const variant = variantMap.get(item.variantId)
      if (!variant) continue

      const existing = grouped.get(variant.id)
      if (existing) {
        existing.quantity += item.quantity
        existing.grossSales += item.subtotal
        existing.discounts += item.discount
        existing.tax += item.taxAmount
        existing.netSales += item.total
        existing.saleCount += 1
      } else {
        grouped.set(variant.id, {
          variantId: variant.id,
          variantName: item.name || variant.name,
          sku: variant.sku,
          quantity: item.quantity,
          grossSales: item.subtotal,
          discounts: item.discount,
          tax: item.taxAmount,
          netSales: item.total,
          saleCount: 1,
        })
      }
    }

    return Array.from(grouped.values())
  }

  private async resolveUnitCostAt(
    movements: StockMovement[],
    variantId: string,
    branchId: string,
    atDate: Date,
  ): Promise<number | undefined> {
    const relevantMovements = movements
      .filter(
        (m) =>
          m.variantId === variantId &&
          m.branchId === branchId &&
          m.movementType === 'purchase' &&
          m.createdAt <= atDate,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return relevantMovements[0]?.unitCost
  }

  async sumMarginByProduct(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<MarginRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)
    const saleIds = new Set(sales.map((s) => s.id))

    const items = await this.saleItemsCollection.filter((i) => saleIds.has(i.saleId))
    const variants = await this.catalogProductVariantsCollection.filter((v) => v.orgId === orgId)
    const movements = await this.stockMovementsCollection.filter((m) => m.orgId === orgId)

    const variantMap = new Map(variants.map((v) => [v.id, v]))
    const saleMap = new Map(sales.map((s) => [s.id, s]))

    const grouped = new Map<string, MarginRow>()

    for (const item of items) {
      const variant = variantMap.get(item.variantId)
      if (!variant) continue

      const sale = saleMap.get(item.saleId)
      if (!sale) continue

      const unitCost = await this.resolveUnitCostAt(movements, variant.id, sale.branchId, sale.createdAt)

      const existing = grouped.get(variant.id)
      if (existing) {
        existing.quantitySold += item.quantity
        existing.revenue += item.subtotal

        if (unitCost !== undefined) {
          const cogs = unitCost * item.quantity
          existing.cogs = (existing.cogs ?? 0) + cogs
          existing.margin = (existing.margin ?? 0) + (item.subtotal - cogs)
        }
      } else {
        let cogs: number | undefined
        let margin: number | undefined
        let costUnavailable = false

        if (unitCost !== undefined) {
          cogs = unitCost * item.quantity
          margin = item.subtotal - cogs
        } else {
          costUnavailable = true
        }

        grouped.set(variant.id, {
          variantId: variant.id,
          variantName: item.name || variant.name,
          sku: variant.sku,
          quantitySold: item.quantity,
          revenue: item.subtotal,
          cogs,
          margin,
          marginPct: margin !== undefined && item.subtotal > 0 ? Math.round((margin / item.subtotal) * 100) : undefined,
          costUnavailable,
        })
      }
    }

    // Update marginPct for all rows after accumulating values
    for (const row of grouped.values()) {
      if (row.margin !== undefined && row.revenue > 0) {
        row.marginPct = Math.round((row.margin / row.revenue) * 100)
      }
    }

    return Array.from(grouped.values())
  }

  async sumTaxByRate(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<TaxRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)
    const saleIds = new Set(sales.map((s) => s.id))

    const items = await this.saleItemsCollection.filter((i) => saleIds.has(i.saleId))

    const grouped = new Map<number, TaxRow>()

    for (const item of items) {
      const rate = item.taxRate ?? 0
      const existing = grouped.get(rate)
      if (existing) {
        existing.taxCollected += item.taxAmount
        existing.taxableSales += item.subtotal
      } else {
        grouped.set(rate, {
          taxRate: rate,
          taxCollected: item.taxAmount,
          taxableSales: item.subtotal,
        })
      }
    }

    return Array.from(grouped.values()).sort((a, b) => a.taxRate - b.taxRate)
  }

  async sumPaymentsByMethod(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<PaymentMethodRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)
    const saleIds = new Set(sales.map((s) => s.id))

    const payments = await this.paymentsCollection.filter(
      (p) => saleIds.has(p.saleId) && p.status === 'completed',
    )

    const grouped = new Map<string, PaymentMethodRow>()

    for (const payment of payments) {
      const method = payment.method || 'unknown'
      const existing = grouped.get(method)
      if (existing) {
        existing.amount += payment.amount
        existing.count += 1
      } else {
        grouped.set(method, {
          method,
          amount: payment.amount,
          count: 1,
        })
      }
    }

    return Array.from(grouped.values())
  }

  private getPeriodBucket(date: Date, granularity: ReportGranularity, timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
    })

    const parts = formatter.formatToParts(date)
    const year = parts.find((p) => p.type === 'year')?.value || '2000'
    const month = parts.find((p) => p.type === 'month')?.value || '01'
    const day = parts.find((p) => p.type === 'day')?.value || '01'

    if (granularity === 'day') {
      return `${year}-${month}-${day}`
    }

    // For week and month, use ISO weeks/months
    const d = new Date(date)
    if (granularity === 'month') {
      return `${year}-${month}`
    }

    // Week: find week number
    const janFourth = new Date(parseInt(year), 0, 4)
    const weekOne = new Date(janFourth)
    weekOne.setDate(janFourth.getDate() - janFourth.getDay())
    const diff = date.getTime() - weekOne.getTime()
    const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
    return `${year}-W${String(weekNum).padStart(2, '0')}`
  }

  async countSalesByHour(
    orgId: string,
    range: ReportRange,
    timezone: string,
    filter?: ReportFilter,
  ): Promise<HourlyHeatmapRow[]> {
    const sales = await this.selectScopedSales(orgId, range, filter)

    const grouped = new Map<string, HourlyHeatmapRow>()

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      hour: '2-digit',
      hour12: false,
    })

    for (const sale of sales) {
      const parts = formatter.formatToParts(sale.createdAt)
      const weekday = parts.find((p) => p.type === 'weekday')?.value || 'Monday'
      const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0')

      const dayNum = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekday)

      const key = `${dayNum}-${hour}`
      const existing = grouped.get(key)
      if (existing) {
        existing.saleCount += 1
        existing.netSales += sale.total
      } else {
        grouped.set(key, {
          dayOfWeek: dayNum,
          hour,
          saleCount: 1,
          netSales: sale.total,
        })
      }
    }

    return Array.from(grouped.values()).sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
      return a.hour - b.hour
    })
  }

  async saveZReport(report: ZReport): Promise<void> {
    await this.zReportsCollection.put(report)
  }

  async findZReportByShift(shiftId: string): Promise<ZReport | null> {
    const reports = await this.zReportsCollection.filter((r) => r.shiftId === shiftId)
    return reports[0] ?? null
  }

  async listZReportsByBranch(orgId: string, branchId: string, range?: ReportRange): Promise<ZReport[]> {
    return this.zReportsCollection.filter(
      (r) =>
        r.orgId === orgId &&
        r.branchId === branchId &&
        (!range || (r.generatedAt >= range.from && r.generatedAt <= range.to)),
    )
  }
}
