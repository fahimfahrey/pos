import type { StocktakeStatus } from '@constants/enums'

export interface StocktakeSession {
  id: string
  orgId: string
  branchId: string
  status: StocktakeStatus
  createdBy: string
  createdAt: Date
  submittedAt?: Date
  approvedBy?: string
  approvedAt?: Date
  updatedAt: Date
}
