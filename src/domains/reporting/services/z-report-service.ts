import type { ZReport } from '../entities/z-report'
import type { ReportingRepository } from '../repository'
import type { SalesRepository } from '@domains/sales/repository'
import type { PaymentsRepository } from '@domains/payments/repository'
import type { ShiftService } from '@domains/sales/services/shift-service'
import type { IdGenerator } from '@shared/ports/id-generator'
import type { Clock } from '@shared/ports/clock'
import { ConflictError } from '@shared/errors'

export interface RepositoriesForZReport {
  reporting: ReportingRepository
  sales: SalesRepository
  payments: PaymentsRepository
}

export class ZReportService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
    private shiftService: ShiftService,
  ) {}

  async closeShiftAndGenerateReport(
    repos: RepositoriesForZReport,
    input: {
      shiftId: string
      countedAmount: number
      actingUserId: string
    },
  ): Promise<{ shift: any; report: ZReport }> {
    const existingReport = await repos.reporting.findZReportByShift(input.shiftId)
    if (existingReport) {
      throw new ConflictError('Z-report already exists for this shift')
    }

    const shift = await this.shiftService.closeShift(repos.sales, {
      shiftId: input.shiftId,
      countedAmount: input.countedAmount,
    })

    const sales = await repos.sales.listSalesByShift(shift.id)
    const allPayments: Array<{ saleId: string; method: string; amount: number; status: string }> = []

    for (const sale of sales) {
      const payments = await repos.payments.listPaymentsForSale(sale.id)
      for (const payment of payments) {
        allPayments.push({
          saleId: payment.saleId,
          method: payment.method,
          amount: payment.amount,
          status: payment.status,
        })
      }
    }

    let cashSales = 0
    let nonCashSales = 0
    let refunds = 0

    for (const sale of sales) {
      const salePayments = allPayments.filter((p) => p.saleId === sale.id && p.status === 'completed')
      for (const payment of salePayments) {
        if (payment.method === 'cash') {
          cashSales += payment.amount
        } else {
          nonCashSales += payment.amount
        }
      }

      // Handle refunds (typically stored as negative payments or in a refunds table)
      const refunds_ = await repos.payments.listRefundsForSale(sale.id)
      for (const refund of refunds_) {
        refunds += refund.amount
      }
    }

    const paymentMethods = new Map<string, { amount: number; count: number }>()
    for (const payment of allPayments.filter((p) => p.status === 'completed')) {
      const existing = paymentMethods.get(payment.method)
      if (existing) {
        existing.amount += payment.amount
        existing.count += 1
      } else {
        paymentMethods.set(payment.method, { amount: payment.amount, count: 1 })
      }
    }

    const paymentMethodBreakdown = Array.from(paymentMethods.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
    }))

    const grossSales = sales.reduce((sum, s) => sum + s.subtotal, 0)
    const discounts = sales.reduce((sum, s) => sum + s.discount, 0)
    const taxCollected = sales.reduce((sum, s) => sum + s.tax, 0)
    const netSales = sales.reduce((sum, s) => sum + s.total, 0)

    const report: ZReport = {
      id: this.ids.generate(),
      orgId: shift.orgId,
      branchId: shift.branchId,
      shiftId: shift.id,
      registerId: shift.registerId,
      cashierUserId: shift.cashierUserId,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt || new Date(),
      openingFloat: shift.floatAmount,
      cashSales,
      nonCashSales,
      expectedCashAmount: shift.expectedAmount,
      countedCashAmount: shift.countedAmount,
      discrepancy: shift.variance,
      grossSales,
      discounts,
      taxCollected,
      netSales,
      refunds,
      saleCount: sales.length,
      paymentMethodBreakdown,
      generatedAt: this.clock.now(),
      generatedBy: input.actingUserId,
    }

    await repos.reporting.saveZReport(report)

    return { shift, report }
  }
}
