export interface CartSnapshotLine {
  variantId: string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CartSnapshot {
  registerId: string
  lines: CartSnapshotLine[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status?: 'cart' | 'payment' | 'complete'
  updatedAt: string
}
