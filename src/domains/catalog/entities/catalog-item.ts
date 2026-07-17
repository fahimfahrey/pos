export interface Category {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CatalogItem {
  id: string
  productId: string
  categoryId: string
  sku: string
  barcode?: string
  name: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
