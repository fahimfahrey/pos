import { AppError } from '@shared/errors'

export class SupplierNotFoundError extends AppError {
  constructor(message = 'Supplier not found') {
    super('SUPPLIER_NOT_FOUND', 404, message)
    Object.setPrototypeOf(this, SupplierNotFoundError.prototype)
  }
}

export class PurchaseOrderNotFoundError extends AppError {
  constructor(message = 'Purchase order not found') {
    super('PURCHASE_ORDER_NOT_FOUND', 404, message)
    Object.setPrototypeOf(this, PurchaseOrderNotFoundError.prototype)
  }
}

export class InvalidPurchaseOrderStatusError extends AppError {
  constructor(message = 'Invalid purchase order status for this operation') {
    super('INVALID_PURCHASE_ORDER_STATUS', 409, message)
    Object.setPrototypeOf(this, InvalidPurchaseOrderStatusError.prototype)
  }
}

export class OverReceiptError extends AppError {
  constructor(message = 'Quantity received exceeds purchase order quantity') {
    super('OVER_RECEIPT', 409, message)
    Object.setPrototypeOf(this, OverReceiptError.prototype)
  }
}
