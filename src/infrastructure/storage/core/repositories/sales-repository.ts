// eslint-disable-next-line boundaries/no-unknown
import type { SalesRepository } from '@domains/sales/repository'
import type { Sale } from '@domains/sales/entities/sale'
import type { SaleItem } from '@domains/sales/entities/sale-item'
import type { Shift } from '@domains/sales/entities/shift'
import type { ParkedCart } from '@domains/sales/entities/parked-cart'
import type { ReceiptCounter } from '@domains/sales/entities/receipt-counter'
import type { Payment } from '@domains/payments/entities/payment'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreSalesRepository implements SalesRepository {
  private salesCollection: Collection<Sale>
  private saleItemsCollection: Collection<SaleItem>
  private shiftsCollection: Collection<Shift>
  private parkedCartsCollection: Collection<ParkedCart>
  private receiptCountersCollection: Collection<ReceiptCounter>
  private paymentsCollection: Collection<Payment>

  constructor(tx: DriverTransaction) {
    this.salesCollection = new Collection<Sale>(tx, 'sales')
    this.saleItemsCollection = new Collection<SaleItem>(tx, 'saleItems')
    this.shiftsCollection = new Collection<Shift>(tx, 'shifts')
    this.parkedCartsCollection = new Collection<ParkedCart>(tx, 'parkedCarts')
    this.receiptCountersCollection = new Collection<ReceiptCounter>(tx, 'receiptCounters')
    this.paymentsCollection = new Collection<Payment>(tx, 'payments')
  }

  // Sales
  async findSaleById(saleId: string): Promise<Sale | null> {
    return (await this.salesCollection.get(saleId)) ?? null
  }

  async saveSale(sale: Sale): Promise<void> {
    await this.salesCollection.put(sale)
  }

  async listSalesByBranch(branchId: string, limit?: number, offset?: number): Promise<Sale[]> {
    const sales = await this.salesCollection.filter((s) => s.branchId === branchId)
    const start = offset ?? 0
    const end = limit ? start + limit : undefined
    return sales.slice(start, end)
  }

  async listSalesByShift(shiftId: string): Promise<Sale[]> {
    return this.salesCollection.filter((s) => s.shiftId === shiftId)
  }
  async listSalesByCustomer(customerId: string): Promise<Sale[]> {
    return this.salesCollection.filter((s) => s.customerId === customerId)
  }

  // Sale Items
  async findSaleItemById(itemId: string): Promise<SaleItem | null> {
    return (await this.saleItemsCollection.get(itemId)) ?? null
  }

  async saveSaleItem(item: SaleItem): Promise<void> {
    await this.saleItemsCollection.put(item)
  }

  async listSaleItems(saleId: string): Promise<SaleItem[]> {
    return this.saleItemsCollection.filter((item) => item.saleId === saleId)
  }

  // Shifts
  async findShiftById(shiftId: string): Promise<Shift | null> {
    return (await this.shiftsCollection.get(shiftId)) ?? null
  }

  async saveShift(shift: Shift): Promise<void> {
    await this.shiftsCollection.put(shift)
  }

  async findOpenShiftForRegister(registerId: string): Promise<Shift | null> {
    const shifts = await this.shiftsCollection.filter(
      (s) => s.registerId === registerId && s.status === 'open',
    )
    return shifts[0] ?? null
  }

  async listShiftsByBranch(branchId: string, limit?: number, offset?: number): Promise<Shift[]> {
    const shifts = await this.shiftsCollection.filter((s) => s.branchId === branchId)
    const start = offset ?? 0
    const end = limit ? start + limit : undefined
    return shifts.slice(start, end)
  }

  // Parked Carts
  async findParkedCartById(cartId: string): Promise<ParkedCart | null> {
    return (await this.parkedCartsCollection.get(cartId)) ?? null
  }

  async saveParkedCart(cart: ParkedCart): Promise<void> {
    await this.parkedCartsCollection.put(cart)
  }

  async deleteParkedCart(cartId: string): Promise<void> {
    await this.parkedCartsCollection.delete(cartId)
  }

  async listParkedCarts(registerId: string): Promise<ParkedCart[]> {
    return this.parkedCartsCollection.filter((cart) => cart.registerId === registerId)
  }

  // Receipt Counters
  async findReceiptCounter(branchId: string): Promise<ReceiptCounter | null> {
    const counters = await this.receiptCountersCollection.filter((c) => c.branchId === branchId)
    return counters[0] ?? null
  }

  async saveReceiptCounter(counter: ReceiptCounter): Promise<void> {
    await this.receiptCountersCollection.put(counter)
  }

  // Payments
  async listPaymentsForSale(saleId: string): Promise<Payment[]> {
    return this.paymentsCollection.filter((p) => p.saleId === saleId)
  }
}
