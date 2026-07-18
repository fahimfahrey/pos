// eslint-disable-next-line boundaries/no-unknown
import type { CatalogRepository } from '@domains/catalog/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { Category } from '@domains/catalog/entities/category'
// eslint-disable-next-line boundaries/no-unknown
import type { Product } from '@domains/catalog/entities/product'
// eslint-disable-next-line boundaries/no-unknown
import type { ProductVariant } from '@domains/catalog/entities/product-variant'
// eslint-disable-next-line boundaries/no-unknown
import type { PriceList, PriceListEntry } from '@domains/catalog/entities/price-list'

import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreCatalogRepository implements CatalogRepository {
  private categoryCollection: Collection<Category>
  private productCollection: Collection<Product>
  private variantCollection: Collection<ProductVariant>
  private priceListCollection: Collection<PriceList>
  private priceListEntryCollection: Collection<PriceListEntry>

  constructor(tx: DriverTransaction) {
    this.categoryCollection = new Collection<Category>(tx, 'categories')
    this.productCollection = new Collection<Product>(tx, 'catalogProducts')
    this.variantCollection = new Collection<ProductVariant>(tx, 'catalogProductVariants')
    this.priceListCollection = new Collection<PriceList>(tx, 'priceLists')
    this.priceListEntryCollection = new Collection<PriceListEntry>(tx, 'priceListEntries')
  }

  // Categories
  async saveCategory(category: Category): Promise<void> {
    await this.categoryCollection.put(category)
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return (await this.categoryCollection.get(id)) ?? null
  }

  async listCategoriesByOrg(orgId: string): Promise<Category[]> {
    return this.categoryCollection.filter((c) => c.orgId === orgId && c.active)
  }

  async deleteCategory(id: string): Promise<void> {
    await this.categoryCollection.delete(id)
  }

  // Products
  async saveProduct(product: Product): Promise<void> {
    await this.productCollection.put(product)
  }

  async findProductById(id: string): Promise<Product | null> {
    return (await this.productCollection.get(id)) ?? null
  }

  async listProductsByOrg(orgId: string): Promise<Product[]> {
    return this.productCollection.filter((p) => p.orgId === orgId && p.active)
  }

  async searchProductsByName(orgId: string, query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase()
    return this.productCollection.filter(
      (p) => p.orgId === orgId && p.active && p.name.toLowerCase().includes(lowerQuery),
    )
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productCollection.delete(id)
  }

  // Product Variants
  async saveVariant(variant: ProductVariant): Promise<void> {
    await this.variantCollection.put(variant)
  }

  async findVariantById(id: string): Promise<ProductVariant | null> {
    return (await this.variantCollection.get(id)) ?? null
  }

  async findVariantBySku(orgId: string, sku: string): Promise<ProductVariant | null> {
    return this.variantCollection.findByIndex(
      '[orgId+sku]',
      [orgId, sku],
      (v) => v.orgId === orgId && v.sku === sku,
    )
  }

  async findVariantByBarcode(orgId: string, barcode: string): Promise<ProductVariant | null> {
    if (!barcode) return null
    return this.variantCollection.findByIndex(
      '[orgId+barcode]',
      [orgId, barcode],
      (v) => v.orgId === orgId && v.barcode === barcode,
    )
  }

  async listVariantsByProduct(productId: string): Promise<ProductVariant[]> {
    return this.variantCollection.filter((v) => v.productId === productId && v.active)
  }

  async listVariantsByOrg(orgId: string): Promise<ProductVariant[]> {
    return this.variantCollection.filter((v) => v.orgId === orgId && v.active)
  }

  async deleteVariant(id: string): Promise<void> {
    await this.variantCollection.delete(id)
  }

  // Price Lists
  async savePriceList(priceList: PriceList): Promise<void> {
    await this.priceListCollection.put(priceList)
  }

  async findPriceListById(id: string): Promise<PriceList | null> {
    return (await this.priceListCollection.get(id)) ?? null
  }

  async listPriceListsByOrg(orgId: string): Promise<PriceList[]> {
    return this.priceListCollection.filter((pl) => pl.orgId === orgId && pl.active)
  }

  async savePriceListEntry(entry: PriceListEntry): Promise<void> {
    await this.priceListEntryCollection.put(entry)
  }

  async listPriceListEntries(priceListId: string): Promise<PriceListEntry[]> {
    return this.priceListEntryCollection.filter((e) => e.priceListId === priceListId)
  }

  async findEffectivePrice(
    orgId: string,
    variantId: string,
    atDate: Date,
  ): Promise<PriceListEntry | null> {
    const priceLists = await this.listPriceListsByOrg(orgId)

    // Find applicable price lists (effectiveFrom <= atDate && (effectiveTo == null || atDate < effectiveTo))
    const applicable = priceLists
      .filter(
        (pl) =>
          pl.effectiveFrom <= atDate &&
          (!pl.effectiveTo || atDate < pl.effectiveTo),
      )
      .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())

    // Find first price list entry for this variant
    for (const pl of applicable) {
      const entries = await this.listPriceListEntries(pl.id)
      const entry = entries.find((e) => e.variantId === variantId)
      if (entry) return entry
    }

    return null
  }
}
