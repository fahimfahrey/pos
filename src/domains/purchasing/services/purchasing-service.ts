import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import type { Supplier } from '@domains/purchasing/entities/supplier'
import type { PurchaseOrder, PurchaseOrderLine } from '@domains/purchasing/entities/purchase-order'
import type { GoodsReceipt, GoodsReceiptLine } from '@domains/purchasing/entities/goods-receipt'
import type { PurchasingRepository } from '@domains/purchasing/repository'
import type { InventoryRepository } from '@domains/inventory/repository'
import { PurchaseOrderNotFoundError, InvalidPurchaseOrderStatusError, OverReceiptError } from '../errors'
import { InventoryService } from '@domains/inventory/services/inventory-service'

export interface ReceiveGoodsInput {
  orgId: string
  branchId: string
  purchaseOrderId: string
  lines: Array<{
    purchaseOrderLineId: string
    quantityReceived: number
    unitCost?: number
  }>
  receivedBy: string
  allowOverReceipt?: boolean
}

export interface ReceiveGoodsResult {
  purchaseOrder: PurchaseOrder
  goodsReceipt: GoodsReceipt
}

export class PurchasingService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
    private inventoryService: InventoryService,
  ) {}

  async createSupplier(
    repos: { purchasing: PurchasingRepository },
    input: Supplier,
  ): Promise<Supplier> {
    await repos.purchasing.saveSupplier(input)
    return input
  }

  async createPurchaseOrder(
    repos: { purchasing: PurchasingRepository },
    input: Omit<PurchaseOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<PurchaseOrder> {
    const order: PurchaseOrder = {
      ...input,
      id: this.ids.next(),
      status: 'draft',
      lines: input.lines.map((line) => ({
        ...line,
        receivedQuantity: 0,
      })),
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }

    await repos.purchasing.savePurchaseOrder(order)
    return order
  }

  async submitPurchaseOrder(
    repos: { purchasing: PurchasingRepository },
    id: string,
  ): Promise<PurchaseOrder> {
    const po = await repos.purchasing.findPurchaseOrderById(id)
    if (!po) {
      throw new PurchaseOrderNotFoundError()
    }

    if (po.status !== 'draft') {
      throw new InvalidPurchaseOrderStatusError('Can only submit draft purchase orders')
    }

    const updated = {
      ...po,
      status: 'submitted' as const,
      updatedAt: this.clock.now(),
    }

    await repos.purchasing.savePurchaseOrder(updated)
    return updated
  }

  async receiveGoods(
    repos: { purchasing: PurchasingRepository; inventory: InventoryRepository },
    input: ReceiveGoodsInput,
  ): Promise<ReceiveGoodsResult> {
    const po = await repos.purchasing.findPurchaseOrderById(input.purchaseOrderId)
    if (!po) {
      throw new PurchaseOrderNotFoundError()
    }

    if (po.status === 'received' || po.status === 'cancelled') {
      throw new InvalidPurchaseOrderStatusError('Cannot receive goods for this purchase order')
    }

    for (const inputLine of input.lines) {
      const poLine = po.lines.find((l) => l.id === inputLine.purchaseOrderLineId)
      if (!poLine) {
        continue
      }

      const remaining = poLine.quantity - poLine.receivedQuantity
      if (inputLine.quantityReceived > remaining && !input.allowOverReceipt) {
        throw new OverReceiptError(
          `Quantity ${inputLine.quantityReceived} exceeds remaining ${remaining}`,
        )
      }
    }

    const goodsReceiptLines: GoodsReceiptLine[] = []

    for (const inputLine of input.lines) {
      const poLine = po.lines.find((l) => l.id === inputLine.purchaseOrderLineId)
      if (!poLine) {
        continue
      }

      poLine.receivedQuantity += inputLine.quantityReceived

      const unitCost = inputLine.unitCost ?? poLine.unitPrice

      await this.inventoryService.receivePurchase({ inventory: repos.inventory }, {
        orgId: input.orgId,
        branchId: input.branchId,
        variantId: poLine.productId,
        quantity: inputLine.quantityReceived,
        reference: input.purchaseOrderId,
        unitCost,
        createdBy: input.receivedBy,
        allowOversell: true,
      })

      goodsReceiptLines.push({
        id: this.ids.next(),
        purchaseOrderLineId: inputLine.purchaseOrderLineId,
        variantId: poLine.productId,
        quantityReceived: inputLine.quantityReceived,
        unitCost,
      })
    }

    const allLinesFullyReceived = po.lines.every((line) => line.receivedQuantity >= line.quantity)

    const updated: PurchaseOrder = {
      ...po,
      status: allLinesFullyReceived ? 'received' : 'submitted',
      receivedAt: allLinesFullyReceived ? this.clock.now() : po.receivedAt,
      updatedAt: this.clock.now(),
    }

    await repos.purchasing.savePurchaseOrder(updated)

    const goodsReceipt: GoodsReceipt = {
      id: this.ids.next(),
      orgId: input.orgId,
      branchId: input.branchId,
      purchaseOrderId: input.purchaseOrderId,
      lines: goodsReceiptLines,
      receivedBy: input.receivedBy,
      receivedAt: this.clock.now(),
      createdAt: this.clock.now(),
    }

    await repos.purchasing.saveGoodsReceipt(goodsReceipt)

    return { purchaseOrder: updated, goodsReceipt }
  }
}
