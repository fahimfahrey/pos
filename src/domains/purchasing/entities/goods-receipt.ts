export interface GoodsReceiptLine {
  id: string
  purchaseOrderLineId: string
  variantId: string
  quantityReceived: number
  unitCost: number
}

export interface GoodsReceipt {
  id: string
  orgId: string
  branchId: string
  purchaseOrderId: string
  lines: GoodsReceiptLine[]
  receivedBy: string
  receivedAt: Date
  createdAt: Date
}
