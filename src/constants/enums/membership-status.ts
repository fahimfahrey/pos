export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INVITED: 'invited',
} as const

export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS]
