import type { StockMovementType } from '@constants/enums'

export interface StockMovement {
  id: string
  orgId: string
  branchId: string
  variantId: string
  quantity: number
  movementType: StockMovementType
  reason?: string
  reference?: string
  relatedMovementId?: string
  createdAt: Date
  createdBy: string
}
