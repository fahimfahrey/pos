import type { Order } from '@domains/sales/entities/order'
import type { SalesRepository } from '@domains/sales/repositories/sales-repository'
import { ORDER_STATUS } from '@constants/enums/order-status'
import { db } from '@infra/db/dexie-db'

export class DexieSalesRepository implements SalesRepository {
  async save(order: Order): Promise<void> {
    await db.orders.put(order)
  }

  async findById(id: string): Promise<Order | null> {
    const order = await db.orders.get(id)
    return order ?? null
  }

  async listOpen(): Promise<Order[]> {
    return db.orders.where('status').equals(ORDER_STATUS.OPEN).toArray()
  }
}
