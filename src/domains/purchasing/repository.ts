import type { Supplier } from '@domains/purchasing/entities/supplier'
import type { PurchaseOrder } from '@domains/purchasing/entities/purchase-order'
import type { GoodsReceipt } from '@domains/purchasing/entities/goods-receipt'

export interface PurchasingRepository {
  saveSupplier(supplier: Supplier): Promise<void>
  findSupplierById(id: string): Promise<Supplier | null>
  listSuppliers(): Promise<Supplier[]>
  savePurchaseOrder(order: PurchaseOrder): Promise<void>
  findPurchaseOrderById(id: string): Promise<PurchaseOrder | null>
  listOpenPurchaseOrders(): Promise<PurchaseOrder[]>
  listPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]>
  markReceived(id: string, receivedAt: Date): Promise<void>
  listSuppliersByOrg(orgId: string): Promise<Supplier[]>
  listPurchaseOrdersByOrg(orgId: string): Promise<PurchaseOrder[]>
  saveGoodsReceipt(receipt: GoodsReceipt): Promise<void>
  findGoodsReceiptById(id: string): Promise<GoodsReceipt | null>
  listGoodsReceiptsForPurchaseOrder(purchaseOrderId: string): Promise<GoodsReceipt[]>
}
