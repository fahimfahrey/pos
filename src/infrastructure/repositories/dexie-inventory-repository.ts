import type { Product } from '@domains/inventory/entities/product'
import type { InventoryRepository } from '@domains/inventory/repositories/inventory-repository'
import { db } from '@infra/db/dexie-db'

export class DexieInventoryRepository implements InventoryRepository {
  async save(product: Product): Promise<void> {
    await db.products.put(product)
  }

  async findById(id: string): Promise<Product | null> {
    const product = await db.products.get(id)
    return product ?? null
  }

  async listAll(): Promise<Product[]> {
    return db.products.toArray()
  }
}
