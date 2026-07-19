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
} from './entities/report-rows'
import type { ZReport } from './entities/z-report'

export interface ReportingRepository {
  sumSalesByPeriod(
    orgId: string,
    range: ReportRange,
    granularity: ReportGranularity,
    timezone: string,
    filter?: ReportFilter,
  ): Promise<SalesPeriodRow[]>

  sumSalesByBranch(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesBranchRow[]>

  sumSalesByCashier(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesCashierRow[]>

  sumSalesByCategory(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesCategoryRow[]>

  sumSalesByProduct(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<SalesProductRow[]>

  sumMarginByProduct(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<MarginRow[]>

  sumTaxByRate(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<TaxRow[]>

  sumPaymentsByMethod(orgId: string, range: ReportRange, filter?: ReportFilter): Promise<PaymentMethodRow[]>

  countSalesByHour(
    orgId: string,
    range: ReportRange,
    timezone: string,
    filter?: ReportFilter,
  ): Promise<HourlyHeatmapRow[]>

  saveZReport(report: ZReport): Promise<void>

  findZReportByShift(shiftId: string): Promise<ZReport | null>

  listZReportsByBranch(orgId: string, branchId: string, range?: ReportRange): Promise<ZReport[]>
}
