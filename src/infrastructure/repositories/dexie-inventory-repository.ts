import type { Product } from '@domains/inventory/entities/product'
import type { StockLevel } from '@domains/inventory/entities/stock-level'
import type { StockMovement } from '@domains/inventory/entities/stock-movement'
import type { StocktakeSession } from '@domains/inventory/entities/stocktake-session'
import type { StocktakeCount } from '@domains/inventory/entities/stocktake-count'
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

  async findStockLevel(_branchId: string, _variantId: string): Promise<StockLevel | null> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async saveStockLevel(_level: StockLevel): Promise<void> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async listStockLevelsByBranch(_branchId: string): Promise<StockLevel[]> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async listLowStock(_branchId: string): Promise<StockLevel[]> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async appendMovement(_movement: StockMovement): Promise<void> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async listMovementsForVariant(_orgId: string, _branchId: string, _variantId: string): Promise<StockMovement[]> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async listMovementsForBranch(_orgId: string, _branchId: string): Promise<StockMovement[]> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async saveStocktakeSession(_session: StocktakeSession): Promise<void> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async findStocktakeSessionById(_id: string): Promise<StocktakeSession | null> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async listStocktakeSessionsByBranch(_branchId: string): Promise<StocktakeSession[]> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async saveStocktakeCount(_count: StocktakeCount): Promise<void> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }

  async listStocktakeCounts(_sessionId: string): Promise<StocktakeCount[]> {
    throw new Error('Not implemented in legacy Dexie adapter')
  }
}
