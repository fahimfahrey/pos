import { ORDER_STATUS, type OrderStatus } from '@constants/enums/order-status'
import { PAYMENT_METHOD, type PaymentMethod } from '@constants/enums/payment-method'

export interface Money {
  amount: number
  currency: string
}

export interface OrderLine {
  id: string
  productId: string
  quantity: number
  unitPrice: Money
  subtotal: Money
}

export interface Order {
  id: string
  status: OrderStatus
  lines: OrderLine[]
  total: Money
  paymentMethod?: PaymentMethod
  createdAt: Date
  updatedAt: Date
}
