// eslint-disable-next-line boundaries/no-unknown
import type { PurchasingRepository } from '@domains/purchasing/repository'
 
import type { Supplier } from '@domains/purchasing/entities/supplier'
 
import type { PurchaseOrder } from '@domains/purchasing/entities/purchase-order'
import type { GoodsReceipt } from '@domains/purchasing/entities/goods-receipt'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CorePurchasingRepository implements PurchasingRepository {
  private supplierCollection: Collection<Supplier>
  private orderCollection: Collection<PurchaseOrder>
  private goodsReceiptCollection: Collection<GoodsReceipt>

  constructor(tx: DriverTransaction) {
    this.supplierCollection = new Collection<Supplier>(tx, 'suppliers')
    this.orderCollection = new Collection<PurchaseOrder>(tx, 'purchaseOrders')
    this.goodsReceiptCollection = new Collection<GoodsReceipt>(tx, 'goodsReceipts')
  }

  async saveSupplier(supplier: Supplier): Promise<void> {
    await this.supplierCollection.put(supplier)
  }

  async findSupplierById(id: string): Promise<Supplier | null> {
    return (await this.supplierCollection.get(id)) ?? null
  }

  async listSuppliers(): Promise<Supplier[]> {
    return this.supplierCollection.getAll()
  }

  async savePurchaseOrder(order: PurchaseOrder): Promise<void> {
    await this.orderCollection.put(order)
  }

  async findPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    return (await this.orderCollection.get(id)) ?? null
  }

  async listOpenPurchaseOrders(): Promise<PurchaseOrder[]> {
    return this.orderCollection.filter((o) => o.status !== 'received' && o.status !== 'cancelled')
  }

  async listPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    return this.orderCollection.filter((o) => o.supplierId === supplierId)
  }

  async markReceived(id: string, receivedAt: Date): Promise<void> {
    const order = await this.findPurchaseOrderById(id)
    if (!order) throw new Error(`PurchaseOrder ${id} not found`)
    order.status = 'received'
    order.receivedAt = receivedAt
    await this.orderCollection.put(order)
  }

  async listSuppliersByOrg(orgId: string): Promise<Supplier[]> {
    return this.supplierCollection.filter((s) => s.orgId === orgId)
  }

  async listPurchaseOrdersByOrg(orgId: string): Promise<PurchaseOrder[]> {
    return this.orderCollection.filter((o) => o.orgId === orgId)
  }

  async saveGoodsReceipt(receipt: GoodsReceipt): Promise<void> {
    await this.goodsReceiptCollection.put(receipt)
  }

  async findGoodsReceiptById(id: string): Promise<GoodsReceipt | null> {
    return (await this.goodsReceiptCollection.get(id)) ?? null
  }

  async listGoodsReceiptsForPurchaseOrder(purchaseOrderId: string): Promise<GoodsReceipt[]> {
    return this.goodsReceiptCollection.filter((g) => g.purchaseOrderId === purchaseOrderId)
  }
}
