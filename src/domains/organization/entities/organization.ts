import type { OrganizationPlan, OrganizationStatus } from '@constants/enums'
import type { OrganizationSettings } from './settings'

export interface Organization {
  id: string
  name: string
  slug?: string
  plan: OrganizationPlan
  status: OrganizationStatus
  settings: OrganizationSettings
  logoUrl?: string
  createdAt: Date
  updatedAt: Date
}
