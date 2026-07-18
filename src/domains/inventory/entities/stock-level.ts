export interface StockLevel {
  id: string
  orgId: string
  branchId: string
  variantId: string
  quantity: number
  reorderThreshold?: number
  updatedAt: Date
}
