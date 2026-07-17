export const ORGANIZATION_PLAN = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

export type OrganizationPlan = (typeof ORGANIZATION_PLAN)[keyof typeof ORGANIZATION_PLAN]
