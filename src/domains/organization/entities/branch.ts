import type { BranchSettings } from './settings'

export interface Branch {
  id: string
  orgId: string
  name: string
  code?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  phone?: string
  email?: string
  timezone?: string
  settings: BranchSettings
  logoUrl?: string
  taxRegistrationNumber?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
