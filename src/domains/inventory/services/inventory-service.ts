import type { Product } from '@domains/inventory/entities/product'
// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'

export class InventoryService {
  constructor(
    private repo: InventoryRepository,
    private clock: Clock,
    private ids: IdGenerator,
  ) {}

  async createProduct(name: string, sku: string, price: { amount: number; currency: string }) {
    const product: Product = {
      id: this.ids.next(),
      name,
      sku,
      price,
      stock: { quantity: 0, unit: 'unit' },
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }

    await this.repo.save(product)
    return product
  }

  async findProduct(id: string) {
    return this.repo.findById(id)
  }

  async listProducts() {
    return this.repo.listAll()
  }
}
