import type { Order } from '@domains/sales/entities/order'

export interface SalesRepository {
  save(order: Order): Promise<void>
  findById(id: string): Promise<Order | null>
  listOpen(): Promise<Order[]>
}
