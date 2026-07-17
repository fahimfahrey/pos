export const MEMBERSHIP_ROLE = {
  OWNER: 1,
  ADMIN: 2,
  MEMBER: 3,
  VIEWER: 4,
} as const

export type MembershipRole = (typeof MEMBERSHIP_ROLE)[keyof typeof MEMBERSHIP_ROLE]
