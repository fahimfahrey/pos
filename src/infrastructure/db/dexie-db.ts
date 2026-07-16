import Dexie, { type Table } from 'dexie'
import type { Order } from '@domains/sales/entities/order'
import type { Product } from '@domains/inventory/entities/product'

export class PosDatabase extends Dexie {
  orders!: Table<Order>
  products!: Table<Product>

  constructor() {
    super('pos-db')
    this.version(1).stores({
      orders: 'id, status, createdAt',
      products: 'id, sku, createdAt',
    })
  }
}

export const db = new PosDatabase()
