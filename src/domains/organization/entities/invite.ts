import type { MembershipRole, InviteStatus } from '@constants/enums'

export interface Invite {
  id: string
  orgId: string
  email: string
  role: MembershipRole
  branchIds: string[]
  token: string
  status: InviteStatus
  invitedBy: string
  expiresAt: Date
  acceptedAt?: Date
  createdAt: Date
  updatedAt: Date
}
