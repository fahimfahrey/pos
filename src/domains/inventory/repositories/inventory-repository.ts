import type { Product } from '@domains/inventory/entities/product'

export interface InventoryRepository {
  save(product: Product): Promise<void>
  findById(id: string): Promise<Product | null>
  listAll(): Promise<Product[]>
}
