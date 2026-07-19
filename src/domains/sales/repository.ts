import type { Sale } from './entities/sale'
import type { SaleItem } from './entities/sale-item'
import type { Shift } from './entities/shift'
import type { ParkedCart } from './entities/parked-cart'
import type { ReceiptCounter } from './entities/receipt-counter'
import type { Payment } from '@domains/payments/entities/payment'

export interface SalesRepository {
  // Sales
  findSaleById(saleId: string): Promise<Sale | null>
  saveSale(sale: Sale): Promise<void>
  listSalesByBranch(branchId: string, limit?: number, offset?: number): Promise<Sale[]>
  listSalesByShift(shiftId: string): Promise<Sale[]>

  // Sale Items
  findSaleItemById(itemId: string): Promise<SaleItem | null>
  saveSaleItem(item: SaleItem): Promise<void>
  listSaleItems(saleId: string): Promise<SaleItem[]>

  // Shifts
  findShiftById(shiftId: string): Promise<Shift | null>
  saveShift(shift: Shift): Promise<void>
  findOpenShiftForRegister(registerId: string): Promise<Shift | null>
  listShiftsByBranch(branchId: string, limit?: number, offset?: number): Promise<Shift[]>

  // Parked Carts
  findParkedCartById(cartId: string): Promise<ParkedCart | null>
  saveParkedCart(cart: ParkedCart): Promise<void>
  deleteParkedCart(cartId: string): Promise<void>
  listParkedCarts(registerId: string): Promise<ParkedCart[]>

  // Receipt Counters
  findReceiptCounter(branchId: string): Promise<ReceiptCounter | null>
  saveReceiptCounter(counter: ReceiptCounter): Promise<void>

  // Payments (cross-domain, but needed for shift closing)
  listPaymentsForSale(saleId: string): Promise<Payment[]>
}
