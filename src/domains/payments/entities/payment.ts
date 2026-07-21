import type { PaymentMethod } from '@constants/enums'
import type { PaymentStatus, RefundStatus } from '@constants/enums'

export interface Payment {
  id: string
  saleId: string
  amount: number
  currency: string
  method: PaymentMethod
  gateway: string
  gatewayRef?: string
  idempotencyKey: string
  status: PaymentStatus
  tendered?: number
  changeDue?: number
  customerId?: string
  failureReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface RefundedItem {
  saleItemId: string
  variantId: string
  quantity: number
}

export interface Refund {
  id: string
  paymentId: string
  saleId: string
  amount: number
  currency: string
  reason: string
  status: RefundStatus
  gatewayRef?: string
  initiatedBy: string
  refundedItems: RefundedItem[]
  createdAt: Date
  completedAt?: Date
}
