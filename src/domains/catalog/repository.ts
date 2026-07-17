import type { Category, CatalogItem } from '@domains/catalog/entities/catalog-item'

export interface CatalogRepository {
  saveCategory(category: Category): Promise<void>
  findCategoryById(id: string): Promise<Category | null>
  listCategories(): Promise<Category[]>
  saveItem(item: CatalogItem): Promise<void>
  findItemById(id: string): Promise<CatalogItem | null>
  findItemBySku(sku: string): Promise<CatalogItem | null>
  findItemByBarcode(barcode: string): Promise<CatalogItem | null>
  listActiveItems(): Promise<CatalogItem[]>
  listItemsByCategory(categoryId: string): Promise<CatalogItem[]>
  searchItemsByName(query: string): Promise<CatalogItem[]>
}
