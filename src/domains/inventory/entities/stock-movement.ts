export interface StockMovement {
  id: string
  productId: string
  quantity: number
  movementType: 'in' | 'out' | 'adjustment'
  reason: string
  createdAt: Date
  createdBy: string
}
