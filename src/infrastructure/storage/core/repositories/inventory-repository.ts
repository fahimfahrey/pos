// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'
 
import type { Product } from '@domains/inventory/entities/product'
 
import type { StockMovement } from '@domains/inventory/entities/stock-movement'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreInventoryRepository implements InventoryRepository {
  private productCollection: Collection<Product>
  private movementCollection: Collection<StockMovement>

  constructor(tx: DriverTransaction) {
    this.productCollection = new Collection<Product>(tx, 'products')
    this.movementCollection = new Collection<StockMovement>(tx, 'stockMovements')
  }

  async save(product: Product): Promise<void> {
    await this.productCollection.put(product)
  }

  async findById(id: string): Promise<Product | null> {
    return (await this.productCollection.get(id)) ?? null
  }

  async listAll(): Promise<Product[]> {
    return this.productCollection.getAll()
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productCollection.find((p) => p.sku === sku)
  }

  async recordMovement(movement: StockMovement): Promise<void> {
    await this.movementCollection.put(movement)
  }

  async listMovements(productId: string): Promise<StockMovement[]> {
    return this.movementCollection.filter((m) => m.productId === productId)
  }
}
