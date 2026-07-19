import type { PaymentStatus } from '@constants/enums'

export interface PaymentStatusEvent {
  id: string
  paymentId: string
  fromStatus: PaymentStatus | null
  toStatus: PaymentStatus
  reason?: string
  actorId?: string
  createdAt: Date
}
