import type { Product } from '@domains/inventory/entities/product'
// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'
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

  async findBySku(sku: string): Promise<Product | null> {
    const product = await db.products.where('sku').equals(sku).first()
    return product ?? null
  }

  async recordMovement(movement: any): Promise<void> {
    // Stub for now - requires stockMovements table in Dexie db
    throw new Error('Not implemented in Dexie adapter')
  }

  async listMovements(productId: string): Promise<any[]> {
    // Stub for now - requires stockMovements table in Dexie db
    throw new Error('Not implemented in Dexie adapter')
  }
}
