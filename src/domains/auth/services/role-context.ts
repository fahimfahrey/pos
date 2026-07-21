import type { SessionClaims } from '@domains/auth/entities/session-claims'
import type { Membership } from '@domains/organization/entities/membership'
import { MEMBERSHIP_ROLE } from '@constants/enums/membership-role'
import { USER_ROLE } from '@constants/enums/user-role'

export type Persona = 'cashier' | 'manager' | 'owner' | 'auditor'

export interface RoleContext {
  persona: Persona
  isOwner: boolean
  isManager: boolean
  isCashier: boolean
  isAuditor: boolean
}

/**
 * Resolve a unified Persona from operational UserRole and organizational MembershipRole.
 *
 * Precedence rule:
 * - MembershipRole.OWNER → 'owner' (unrestricted)
 * - MembershipRole.VIEWER → 'auditor' (read-only, org-wide audit access)
 * - MembershipRole.ADMIN → 'manager' (if no higher UserRole) or defers to UserRole
 * - UserRole.ADMIN → 'manager' (back-office, branch-scoped)
 * - UserRole.MANAGER → 'manager' (back-office, branch-scoped)
 * - UserRole.CASHIER → 'cashier' (register-bound, home + register only)
 *
 * In short: membership role wins for org-level access; operational role wins for register/shift surfaces.
 */
export function resolveRoleContext(
  session: SessionClaims,
  membership: Membership | null
): RoleContext {
  let persona: Persona = 'cashier' // default (most restrictive)

  // Membership role takes precedence for org-level access
  if (membership) {
    if (membership.role === MEMBERSHIP_ROLE.OWNER) {
      persona = 'owner'
    } else if (membership.role === MEMBERSHIP_ROLE.VIEWER) {
      persona = 'auditor'
    } else if (membership.role === MEMBERSHIP_ROLE.ADMIN) {
      // Admin membership: check if there's a higher operational role
      // Admin membership with manager/admin user role → manager
      if (session.roles.includes(USER_ROLE.ADMIN) || session.roles.includes(USER_ROLE.MANAGER)) {
        persona = 'manager'
      } else {
        persona = 'cashier'
      }
    } else if (membership.role === MEMBERSHIP_ROLE.MEMBER) {
      // Member membership: use operational role
      if (session.roles.includes(USER_ROLE.ADMIN)) {
        persona = 'manager'
      } else if (session.roles.includes(USER_ROLE.MANAGER)) {
        persona = 'manager'
      } else {
        persona = 'cashier'
      }
    }
  } else {
    // No membership: use operational role only
    if (session.roles.includes(USER_ROLE.ADMIN)) {
      persona = 'manager'
    } else if (session.roles.includes(USER_ROLE.MANAGER)) {
      persona = 'manager'
    } else {
      persona = 'cashier'
    }
  }

  return {
    persona,
    isOwner: persona === 'owner',
    isManager: persona === 'manager',
    isCashier: persona === 'cashier',
    isAuditor: persona === 'auditor',
  }
}
