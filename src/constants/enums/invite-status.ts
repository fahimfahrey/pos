export const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
} as const

export type InviteStatus = (typeof INVITE_STATUS)[keyof typeof INVITE_STATUS]
