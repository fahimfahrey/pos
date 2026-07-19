import type { RepositorySet } from '@infra/storage'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import type { PaymentStatus, RefundStatus } from '@constants/enums'

export interface ChargeRequest {
  saleId: string
  paymentId: string
  amount: number
  currency: string
  idempotencyKey: string
  tendered?: number
  customerId?: string
}

export interface ChargeResult {
  status: PaymentStatus
  gatewayRef?: string
  changeDue?: number
  raw?: unknown
}

export interface RefundRequest {
  paymentId: string
  gatewayRef?: string
  amount: number
  currency: string
  idempotencyKey: string
  reason: string
  customerId?: string
}

export interface RefundResult {
  status: RefundStatus
  gatewayRef?: string
  raw?: unknown
}

export interface PaymentGatewayContext {
  repos: RepositorySet
  clock: Clock
  ids: IdGenerator
}

export interface PaymentGateway {
  readonly id: string
  readonly requiresServer: boolean
  charge(request: ChargeRequest, ctx: PaymentGatewayContext): Promise<ChargeResult>
  refund(request: RefundRequest, ctx: PaymentGatewayContext): Promise<RefundResult>
}
