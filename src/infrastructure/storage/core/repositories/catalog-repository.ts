// eslint-disable-next-line boundaries/no-unknown
import type { CatalogRepository } from '@domains/catalog/repository'
 
import type { Category, CatalogItem } from '@domains/catalog/entities/catalog-item'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreCatalogRepository implements CatalogRepository {
  private categoryCollection: Collection<Category>
  private itemCollection: Collection<CatalogItem>

  constructor(tx: DriverTransaction) {
    this.categoryCollection = new Collection<Category>(tx, 'categories')
    this.itemCollection = new Collection<CatalogItem>(tx, 'catalogItems')
  }

  async saveCategory(category: Category): Promise<void> {
    await this.categoryCollection.put(category)
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return (await this.categoryCollection.get(id)) ?? null
  }

  async listCategories(): Promise<Category[]> {
    return this.categoryCollection.getAll()
  }

  async saveItem(item: CatalogItem): Promise<void> {
    await this.itemCollection.put(item)
  }

  async findItemById(id: string): Promise<CatalogItem | null> {
    return (await this.itemCollection.get(id)) ?? null
  }

  async findItemBySku(sku: string): Promise<CatalogItem | null> {
    return this.itemCollection.find((item) => item.sku === sku)
  }

  async findItemByBarcode(barcode: string): Promise<CatalogItem | null> {
    return this.itemCollection.find((item) => item.barcode === barcode)
  }

  async listActiveItems(): Promise<CatalogItem[]> {
    return this.itemCollection.filter((item) => item.active)
  }

  async listItemsByCategory(categoryId: string): Promise<CatalogItem[]> {
    return this.itemCollection.filter((item) => item.categoryId === categoryId)
  }

  async searchItemsByName(query: string): Promise<CatalogItem[]> {
    const lowerQuery = query.toLowerCase()
    return this.itemCollection.filter((item) => item.name.toLowerCase().includes(lowerQuery))
  }
}
