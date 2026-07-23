import type { CartDiscount } from './sale'

export interface ParkedCartLine {
  variantId: string
  name: string
  barcode?: string
  price: number
  quantity: number
  discount?: CartDiscount
}

export interface ParkedCart {
  id: string
  orgId: string
  branchId: string
  registerId: string
  cartId: string
  lines: ParkedCartLine[]
  cartDiscount?: CartDiscount
  customerId?: string
  createdAt: Date
  createdBy: string
}
