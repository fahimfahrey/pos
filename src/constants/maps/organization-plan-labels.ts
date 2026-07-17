import { ORGANIZATION_PLAN, type OrganizationPlan } from '../enums'

export const ORGANIZATION_PLAN_LABELS: Record<OrganizationPlan, string> = {
  [ORGANIZATION_PLAN.FREE]: 'Free',
  [ORGANIZATION_PLAN.STARTER]: 'Starter',
  [ORGANIZATION_PLAN.PRO]: 'Pro',
  [ORGANIZATION_PLAN.ENTERPRISE]: 'Enterprise',
}
