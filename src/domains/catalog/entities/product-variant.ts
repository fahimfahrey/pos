export interface ProductVariant {
  id: string
  orgId: string
  productId: string
  sku: string
  barcode?: string
  name?: string
  unitOfMeasure: string
  barcodeSymbology?: string
  isDecimalQuantity: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
}
