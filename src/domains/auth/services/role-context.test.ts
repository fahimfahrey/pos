import { describe, it, expect } from 'vitest'
import { resolveRoleContext, type RoleContext } from './role-context'
import type { SessionClaims } from '@domains/auth/entities/session-claims'
import type { Membership } from '@domains/organization/entities/membership'
import { MEMBERSHIP_ROLE } from '@constants/enums/membership-role'
import { USER_ROLE } from '@constants/enums/user-role'

const baseSession = (roles: string[]): SessionClaims => ({
  sub: 'user-123',
  sessionId: 'session-123',
  orgId: 'org-123',
  roles,
  iat: Date.now(),
  exp: Date.now() + 86400000,
})

const baseMembership = (role: number): Membership => ({
  id: 'membership-123',
  orgId: 'org-123',
  userId: 'user-123',
  role,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('resolveRoleContext', () => {
  describe('MembershipRole.OWNER', () => {
    it('maps owner membership to owner persona regardless of user roles', () => {
      const session = baseSession([USER_ROLE.CASHIER])
      const membership = baseMembership(MEMBERSHIP_ROLE.OWNER)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('owner')
      expect(result.isOwner).toBe(true)
      expect(result.isManager).toBe(false)
      expect(result.isCashier).toBe(false)
      expect(result.isAuditor).toBe(false)
    })
  })

  describe('MembershipRole.VIEWER', () => {
    it('maps viewer membership to auditor persona regardless of user roles', () => {
      const session = baseSession([USER_ROLE.ADMIN])
      const membership = baseMembership(MEMBERSHIP_ROLE.VIEWER)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('auditor')
      expect(result.isAuditor).toBe(true)
      expect(result.isOwner).toBe(false)
      expect(result.isManager).toBe(false)
      expect(result.isCashier).toBe(false)
    })
  })

  describe('MembershipRole.ADMIN', () => {
    it('maps admin membership + admin user role to manager', () => {
      const session = baseSession([USER_ROLE.ADMIN])
      const membership = baseMembership(MEMBERSHIP_ROLE.ADMIN)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('manager')
      expect(result.isManager).toBe(true)
    })

    it('maps admin membership + manager user role to manager', () => {
      const session = baseSession([USER_ROLE.MANAGER])
      const membership = baseMembership(MEMBERSHIP_ROLE.ADMIN)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('manager')
      expect(result.isManager).toBe(true)
    })

    it('maps admin membership + cashier user role to cashier', () => {
      const session = baseSession([USER_ROLE.CASHIER])
      const membership = baseMembership(MEMBERSHIP_ROLE.ADMIN)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('cashier')
      expect(result.isCashier).toBe(true)
    })
  })

  describe('MembershipRole.MEMBER', () => {
    it('maps member membership + admin user role to manager', () => {
      const session = baseSession([USER_ROLE.ADMIN])
      const membership = baseMembership(MEMBERSHIP_ROLE.MEMBER)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('manager')
    })

    it('maps member membership + manager user role to manager', () => {
      const session = baseSession([USER_ROLE.MANAGER])
      const membership = baseMembership(MEMBERSHIP_ROLE.MEMBER)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('manager')
    })

    it('maps member membership + cashier user role to cashier', () => {
      const session = baseSession([USER_ROLE.CASHIER])
      const membership = baseMembership(MEMBERSHIP_ROLE.MEMBER)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('cashier')
    })
  })

  describe('No membership', () => {
    it('uses admin user role when no membership provided', () => {
      const session = baseSession([USER_ROLE.ADMIN])

      const result = resolveRoleContext(session, null)

      expect(result.persona).toBe('manager')
    })

    it('uses manager user role when no membership provided', () => {
      const session = baseSession([USER_ROLE.MANAGER])

      const result = resolveRoleContext(session, null)

      expect(result.persona).toBe('manager')
    })

    it('defaults to cashier when no membership and only cashier role', () => {
      const session = baseSession([USER_ROLE.CASHIER])

      const result = resolveRoleContext(session, null)

      expect(result.persona).toBe('cashier')
    })

    it('defaults to cashier when no membership and empty roles', () => {
      const session = baseSession([])

      const result = resolveRoleContext(session, null)

      expect(result.persona).toBe('cashier')
    })
  })

  describe('Edge cases', () => {
    it('treats unknown membership role as fallback to user role', () => {
      const session = baseSession([USER_ROLE.CASHIER])
      const membership = baseMembership(999 as any)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('cashier')
    })

    it('handles multiple user roles (takes highest)', () => {
      const session = baseSession([USER_ROLE.CASHIER, USER_ROLE.MANAGER])
      const membership = baseMembership(MEMBERSHIP_ROLE.MEMBER)

      const result = resolveRoleContext(session, membership)

      expect(result.persona).toBe('manager')
    })
  })
})
