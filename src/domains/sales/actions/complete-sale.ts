'use server'

import { z } from 'zod'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { SystemClock } from '@infra/adapters/system-clock'
import { requireUser } from '@domains/auth/actions/session'
import { EnumRegistryService } from '@domains/system-enums/services/enum-registry-service'
import { ENUM_REGISTRY_KEY, ORDER_STATUS } from '@constants/enums'
import { toErrorResponse } from '@shared/errors'

const baseInputSchema = z.object({
  orderId: z.string().min(1),
  orgId: z.string().min(1),
  method: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
})

export type CompleteSaleInput = z.infer<typeof baseInputSchema>

export interface CompleteSaleResult {
  ok: boolean
  error?: unknown
  data?: {
    order: any
    payment: any
  }
}

export async function completeSale(input: unknown): Promise<CompleteSaleResult> {
  try {
    const parsed = baseInputSchema.parse(input)
    const user = await requireUser()
    const provider = await getServerStorageProvider()
    const idGen = new UuidIdGenerator()
    const clock = new SystemClock()

    const result = await provider.withTransaction(async (repos) => {
      const enumService = new EnumRegistryService(repos.systemEnums)
      const methodSchema = await enumService.schemaFor(parsed.orgId, ENUM_REGISTRY_KEY.PAYMENT_METHOD)
      const method = methodSchema.parse(parsed.method)

      const order = await repos.sales.findById(parsed.orderId)
      if (!order) throw new Error('Order not found')

      const payment = {
        id: idGen.next(),
        orderId: order.id,
        amount: parsed.amount,
        currency: parsed.currency,
        method,
        status: 'completed' as const,
        createdAt: clock.now(),
        updatedAt: clock.now(),
      }
      await repos.payments.savePayment(payment)

      const updatedOrder = {
        ...order,
        status: ORDER_STATUS.PAID,
        paymentMethod: method as any,
        updatedAt: clock.now(),
      }
      await repos.sales.save(updatedOrder)

      return { order: updatedOrder, payment }
    })
    return { ok: true, data: result }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

// Internal function for testing, accepts explicit provider and userId
export async function completeSaleWithProvider(
  input: CompleteSaleInput,
  provider: any,
  actingUserId: string,
): Promise<CompleteSaleResult> {
  try {
    const parsed = baseInputSchema.parse(input)
    const idGen = new UuidIdGenerator()
    const clock = new SystemClock()

    const result = await provider.withTransaction(async (repos: any) => {
      const enumService = new EnumRegistryService(repos.systemEnums)
      const methodSchema = await enumService.schemaFor(parsed.orgId, ENUM_REGISTRY_KEY.PAYMENT_METHOD)
      const method = methodSchema.parse(parsed.method)

      const order = await repos.sales.findById(parsed.orderId)
      if (!order) throw new Error('Order not found')

      const payment = {
        id: idGen.next(),
        orderId: order.id,
        amount: parsed.amount,
        currency: parsed.currency,
        method,
        status: 'completed' as const,
        createdAt: clock.now(),
        updatedAt: clock.now(),
      }
      await repos.payments.savePayment(payment)

      const updatedOrder = {
        ...order,
        status: ORDER_STATUS.PAID,
        paymentMethod: method as any,
        updatedAt: clock.now(),
      }
      await repos.sales.save(updatedOrder)

      return { order: updatedOrder, payment }
    })
    return { ok: true, data: result }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
