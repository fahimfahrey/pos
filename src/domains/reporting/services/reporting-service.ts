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
} from '../entities/report-rows'
import type { ReportingRepository } from '../repository'
import { resolveReportScope } from './report-access'
import type { ReportAccessContext } from './report-access'

export class ReportingService {
  constructor(private reportingRepo: ReportingRepository, private accessRepos: ReportAccessContext) {}

  async getSalesByPeriod(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    granularity: ReportGranularity,
    timezone: string,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<SalesPeriodRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumSalesByPeriod(orgId, range, granularity, timezone, filter)
  }

  async getSalesByBranch(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<SalesBranchRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumSalesByBranch(orgId, range, filter)
  }

  async getSalesByCashier(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<SalesCashierRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumSalesByCashier(orgId, range, filter)
  }

  async getSalesByCategory(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<SalesCategoryRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumSalesByCategory(orgId, range, filter)
  }

  async getSalesByProduct(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<SalesProductRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumSalesByProduct(orgId, range, filter)
  }

  async getMarginByProduct(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<MarginRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumMarginByProduct(orgId, range, filter)
  }

  async getTaxCollectedByRate(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<TaxRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumTaxByRate(orgId, range, filter)
  }

  async getPaymentMethodBreakdown(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<PaymentMethodRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.sumPaymentsByMethod(orgId, range, filter)
  }

  async getHourlySalesHeatmap(
    orgId: string,
    membership: { id: string; role: number; userId: string; status: string },
    range: ReportRange,
    timezone: string,
    requested?: { branchId?: string; shiftId?: string },
  ): Promise<HourlyHeatmapRow[]> {
    const filter = await resolveReportScope(this.accessRepos, orgId, membership, requested || {})
    return this.reportingRepo.countSalesByHour(orgId, range, timezone, filter)
  }
}
