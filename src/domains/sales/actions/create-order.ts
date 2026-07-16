'use server'

import { z } from 'zod'
import { container } from '@/infrastructure'
import { toErrorResponse } from '@shared/errors'

const createOrderSchema = z.object({
  lines: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.object({
        amount: z.number().positive(),
        currency: z.string().default('USD'),
      }),
    }),
  ),
})

export async function createOrder(input: unknown) {
  try {
    const parsed = createOrderSchema.parse(input)
    const order = await container.salesService.createOrder(parsed.lines)
    return { ok: true, data: order }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
