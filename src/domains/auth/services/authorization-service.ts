import type { Membership } from '@domains/organization/entities/membership'
import { MembershipRole } from '@constants/enums'
import { ForbiddenError, UnauthorizedError } from '@shared/errors'
// eslint-disable-next-line boundaries/no-unknown
import type { OrganizationRepository } from '@domains/organization/repository'

export function hasAtLeast(userRole: MembershipRole, requiredRole: MembershipRole): boolean {
  return userRole <= requiredRole
}

export function requireRole(
  userRole: MembershipRole,
  requiredRole: MembershipRole,
): void {
  if (!hasAtLeast(userRole, requiredRole)) {
    throw new ForbiddenError(
      `Required role: ${requiredRole}, but user has: ${userRole}`,
    )
  }
}

export function assertActive(membership: Membership): void {
  if (membership.status !== 'active') {
    throw new UnauthorizedError(
      `User membership is not active: ${membership.status}`,
    )
  }
}

export async function requireOwnerMembership(
  orgRepo: OrganizationRepository,
  orgId: string,
  userId: string,
): Promise<Membership> {
  const membership = await orgRepo.findMembership(orgId, userId)
  if (!membership) throw new ForbiddenError('No membership in this organization')
  assertActive(membership)
  requireRole(membership.role, MembershipRole.OWNER)
  return membership
}
