import { ORDER_STATUS, type OrderStatus } from '@constants/enums/order-status'
import { DISCOUNT_TYPE, type DiscountType } from '@constants/enums/discount-type'

export type SaleStatus = OrderStatus

export const SALE_STATUS = ORDER_STATUS

export interface CartDiscount {
  id: string
  type: DiscountType
  amount: number
  description?: string
  approvedBy?: string
  expiresAt?: Date
}

export interface Sale {
  id: string
  orgId: string
  branchId: string
  shiftId: string
  status: SaleStatus
  receiptNumber?: number
  customerId?: string
  subtotal: number
  discount: number
  tax: number
  total: number
  createdAt: Date
  createdBy: string
}
