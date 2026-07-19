'use server'

import type { ReportRange, ReportGranularity } from '../entities/report-rows'
import { ReportingService } from '../services/reporting-service'
import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { requireUser } from '@domains/auth/actions/session'
import { toErrorResponse } from '@shared/errors'

export interface GetSalesReportInput {
  from: string
  to: string
  branchId?: string
  shiftId?: string
  granularity?: ReportGranularity
  timezone?: string
}

function parseDate(dateString: string): Date {
  return new Date(dateString)
}

export async function getSalesByPeriod(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getSalesByPeriod(
          membership.orgId,
          membership,
          range,
          input.granularity || 'day',
          input.timezone || 'UTC',
          { branchId: input.branchId, shiftId: input.shiftId },
        )
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getSalesByBranch(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getSalesByBranch(membership.orgId, membership, range, {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getSalesByCashier(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getSalesByCashier(membership.orgId, membership, range, {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getSalesByCategory(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getSalesByCategory(membership.orgId, membership, range, {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getSalesByProduct(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getSalesByProduct(membership.orgId, membership, range, {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getMarginByProduct(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getMarginByProduct(membership.orgId, membership, range, {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getTaxCollectedByRate(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getTaxCollectedByRate(membership.orgId, membership, range, {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getPaymentMethodBreakdown(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getPaymentMethodBreakdown(membership.orgId, membership, range, {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

export async function getHourlySalesHeatmap(input: GetSalesReportInput) {
  try {
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos: any) => {
        const membership = user.membership
        const reportingService = new ReportingService(repos.reporting, {
          organization: repos.organization,
          sales: repos.sales,
        })

        const range: ReportRange = {
          from: parseDate(input.from),
          to: parseDate(input.to),
        }

        return await reportingService.getHourlySalesHeatmap(membership.orgId, membership, range, input.timezone || 'UTC', {
          branchId: input.branchId,
          shiftId: input.shiftId,
        })
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
