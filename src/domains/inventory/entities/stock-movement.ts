import type { StockMovementType } from '@constants/enums'

export interface StockMovement {
  id: string
  productId: string
  quantity: number
  movementType: StockMovementType
  reason: string
  createdAt: Date
  createdBy: string
}
