import { ORDER_STATUS } from '@constants/enums/order-status'
import type { Order, OrderLine, Money } from '@domains/sales/entities/order'
// eslint-disable-next-line boundaries/no-unknown
import type { SalesRepository } from '@domains/sales/repository'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'

export class SalesService {
  constructor(
    private repo: SalesRepository,
    private clock: Clock,
    private ids: IdGenerator,
  ) {}

  async createOrder(lines: Array<{ productId: string; quantity: number; unitPrice: Money }>) {
    const order: Order = {
      id: this.ids.next(),
      status: ORDER_STATUS.DRAFT,
      lines: lines.map((line, i) => ({
        id: `${i}`,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: {
          amount: line.unitPrice.amount * line.quantity,
          currency: line.unitPrice.currency,
        },
      })),
      total: {
        amount: lines.reduce((sum, line) => sum + line.unitPrice.amount * line.quantity, 0),
        currency: lines[0]?.unitPrice.currency ?? 'USD',
      },
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }

    await this.repo.save(order)
    return order
  }

  async findOrder(id: string) {
    return this.repo.findById(id)
  }

  async listOpenOrders() {
    return this.repo.listOpen()
  }
}
