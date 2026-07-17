import type { MembershipRole, MembershipStatus } from '@constants/enums'

export interface Membership {
  id: string
  orgId: string
  userId: string
  role: MembershipRole
  status: MembershipStatus
  createdAt: Date
  updatedAt: Date
}
