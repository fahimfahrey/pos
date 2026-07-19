import type { ReportFilter } from '../entities/report-rows'
import type { OrganizationRepository } from '@domains/organization/repository'
import type { SalesRepository } from '@domains/sales/repository'
import { MEMBERSHIP_ROLE } from '@constants/enums/membership-role'
import { ForbiddenError, UnauthorizedError, ValidationError } from '@shared/errors'

export interface ReportAccessContext {
  organization: OrganizationRepository
  sales: SalesRepository
}

export async function resolveReportScope(
  repos: ReportAccessContext,
  orgId: string,
  membership: { id: string; role: number; userId: string; status: string },
  requested: { branchId?: string; shiftId?: string },
): Promise<ReportFilter> {
  if (membership.status !== 'active') {
    throw new UnauthorizedError('Membership is not active')
  }

  const filter: ReportFilter = {}

  if (membership.role === MEMBERSHIP_ROLE.OWNER || membership.role === MEMBERSHIP_ROLE.VIEWER) {
    if (requested.branchId) {
      filter.branchId = requested.branchId
    }
    if (requested.shiftId) {
      filter.shiftId = requested.shiftId
    }
    return filter
  }

  if (membership.role === MEMBERSHIP_ROLE.ADMIN) {
    if (!requested.branchId) {
      throw new ValidationError('Branch manager must specify branchId')
    }

    const assignments = await repos.organization.listAssignmentsForMembership(membership.id)
    const assignedBranches = assignments.map((a) => a.branchId)

    if (!assignedBranches.includes(requested.branchId)) {
      throw new ForbiddenError('Not assigned to this branch')
    }

    filter.branchId = requested.branchId
    return filter
  }

  if (membership.role === MEMBERSHIP_ROLE.MEMBER) {
    if (!requested.shiftId) {
      throw new ValidationError('Cashier must specify shiftId')
    }

    const shift = await repos.sales.findShiftById(requested.shiftId)
    if (!shift) {
      throw new ValidationError('Shift not found')
    }

    if (shift.cashierUserId !== membership.userId) {
      throw new ForbiddenError('Not the cashier for this shift')
    }

    filter.shiftId = requested.shiftId
    filter.branchId = shift.branchId
    return filter
  }

  throw new UnauthorizedError('Invalid role')
}
