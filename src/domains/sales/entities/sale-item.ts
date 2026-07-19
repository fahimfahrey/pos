export interface SaleItem {
  id: string
  saleId: string
  variantId: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  taxAmount: number
  subtotal: number
  total: number
  name: string
  sku: string
  createdAt: Date
}
