// eslint-disable-next-line boundaries/no-unknown
import type { SalesRepository } from '@domains/sales/repository'
 
import type { Order } from '@domains/sales/entities/order'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreSalesRepository implements SalesRepository {
  private collection: Collection<Order>

  constructor(tx: DriverTransaction) {
    this.collection = new Collection<Order>(tx, 'orders')
  }

  async save(order: Order): Promise<void> {
    await this.collection.put(order)
  }

  async findById(id: string): Promise<Order | null> {
    return (await this.collection.get(id)) ?? null
  }

  async listOpen(): Promise<Order[]> {
    return this.collection.filter((order) => order.status === 'open')
  }

  async listByStatus(status: string): Promise<Order[]> {
    return this.collection.filter((order) => order.status === status)
  }

  async listByDateRange(from: Date, to: Date): Promise<Order[]> {
    return this.collection.filter((order) => order.createdAt >= from && order.createdAt <= to)
  }
}
