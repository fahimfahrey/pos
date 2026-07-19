'use server'

import { z } from 'zod'
import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { SystemClock } from '@infra/adapters/system-clock'
import { requireUser } from '@domains/auth/actions/session'
import { toErrorResponse } from '@shared/errors'
import { PurchasingService } from '../services/purchasing-service'
import { InventoryService } from '@domains/inventory/services/inventory-service'

const baseInputSchema = z.object({
  orgId: z.string().min(1),
  branchId: z.string().min(1),
  purchaseOrderId: z.string().min(1),
  lines: z.array(
    z.object({
      purchaseOrderLineId: z.string().min(1),
      quantityReceived: z.number().positive(),
      unitCost: z.number().positive().optional(),
    }),
  ),
  receivedBy: z.string().min(1),
  allowOverReceipt: z.boolean().optional(),
})

export type ReceiveGoodsInput = z.infer<typeof baseInputSchema>

export interface ReceiveGoodsResult {
  ok: boolean
  error?: unknown
  data?: {
    purchaseOrder: any
    goodsReceipt: any
  }
}

export async function receiveGoods(input: unknown): Promise<ReceiveGoodsResult> {
  try {
    const parsed = baseInputSchema.parse(input)
    const user = await requireUser()
    const provider = await createDefaultStorageProvider()
    const idGen = new UuidIdGenerator()
    const clock = new SystemClock()

    try {
      const result = await provider.withTransaction(async (repos) => {
        const purchasingService = new PurchasingService(
          clock,
          idGen,
          new InventoryService(clock, idGen),
        )

        return purchasingService.receiveGoods(
          {
            purchasing: repos.purchasing,
            inventory: repos.inventory,
          },
          {
            orgId: parsed.orgId,
            branchId: parsed.branchId,
            purchaseOrderId: parsed.purchaseOrderId,
            lines: parsed.lines,
            receivedBy: parsed.receivedBy,
            allowOverReceipt: parsed.allowOverReceipt,
          },
        )
      })
      return { ok: true, data: result }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}

// Internal function for testing, accepts explicit provider and userId
export async function receiveGoodsWithProvider(
  input: ReceiveGoodsInput,
  provider: any,
  actingUserId: string,
): Promise<ReceiveGoodsResult> {
  try {
    const parsed = baseInputSchema.parse(input)
    const idGen = new UuidIdGenerator()
    const clock = new SystemClock()

    const result = await provider.withTransaction(async (repos: any) => {
      const purchasingService = new PurchasingService(
        clock,
        idGen,
        new InventoryService(clock, idGen),
      )

      return purchasingService.receiveGoods(
        {
          purchasing: repos.purchasing,
          inventory: repos.inventory,
        },
        {
          orgId: parsed.orgId,
          branchId: parsed.branchId,
          purchaseOrderId: parsed.purchaseOrderId,
          lines: parsed.lines,
          receivedBy: parsed.receivedBy,
          allowOverReceipt: parsed.allowOverReceipt,
        },
      )
    })
    return { ok: true, data: result }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
