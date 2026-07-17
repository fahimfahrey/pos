import type { Product } from '@domains/inventory/entities/product'
import type { StockMovement } from '@domains/inventory/entities/stock-movement'

export interface InventoryRepository {
  save(product: Product): Promise<void>
  findById(id: string): Promise<Product | null>
  listAll(): Promise<Product[]>
  findBySku(sku: string): Promise<Product | null>
  recordMovement(movement: StockMovement): Promise<void>
  listMovements(productId: string): Promise<StockMovement[]>
}
