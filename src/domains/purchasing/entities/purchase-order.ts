export type PurchaseOrderStatus = 'draft' | 'submitted' | 'confirmed' | 'received' | 'cancelled'

export interface PurchaseOrderLine {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  receivedQuantity: number
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  status: PurchaseOrderStatus
  lines: PurchaseOrderLine[]
  total: number
  currency: string
  expectedDeliveryDate?: Date
  receivedAt?: Date
  createdAt: Date
  updatedAt: Date
}
