'use server'

import { container } from '@/infrastructure'
import { toErrorResponse } from '@shared/errors'

export async function listProducts() {
  try {
    const products = await container.inventoryService.listProducts()
    return { ok: true, data: products }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
