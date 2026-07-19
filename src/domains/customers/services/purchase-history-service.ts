import type { Sale } from '@domains/sales/entities/sale'
import type { SalesRepository } from '@domains/sales/repository'

export class PurchaseHistoryService {
  static async listForCustomer(
    repos: { sales: SalesRepository },
    customerId: string,
  ): Promise<Sale[]> {
    return repos.sales.listSalesByCustomer(customerId)
  }
}
