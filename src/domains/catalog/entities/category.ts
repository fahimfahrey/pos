export interface Category {
  id: string
  orgId: string
  name: string
  description?: string
  taxRuleId?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
