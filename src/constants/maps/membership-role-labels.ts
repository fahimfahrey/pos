import { MEMBERSHIP_ROLE, type MembershipRole } from '../enums'

export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRole, string> = {
  [MEMBERSHIP_ROLE.OWNER]: 'Owner',
  [MEMBERSHIP_ROLE.ADMIN]: 'Branch Manager',
  [MEMBERSHIP_ROLE.MEMBER]: 'Cashier',
  [MEMBERSHIP_ROLE.VIEWER]: 'Accountant / Auditor',
}
