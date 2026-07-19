export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  saleId: string
  amount: number
  currency: string
  method: string
  status: PaymentStatus
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Refund {
  id: string
  paymentId: string
  amount: number
  reason: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
}
