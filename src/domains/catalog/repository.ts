import type { Category } from './entities/category'
import type { Product } from './entities/product'
import type { ProductVariant } from './entities/product-variant'
import type { PriceList, PriceListEntry } from './entities/price-list'

export interface CatalogRepository {
  // Categories
  saveCategory(category: Category): Promise<void>
  findCategoryById(id: string): Promise<Category | null>
  listCategoriesByOrg(orgId: string): Promise<Category[]>
  deleteCategory(id: string): Promise<void>

  // Products (the grouping, non-sellable)
  saveProduct(product: Product): Promise<void>
  findProductById(id: string): Promise<Product | null>
  listProductsByOrg(orgId: string): Promise<Product[]>
  searchProductsByName(orgId: string, query: string): Promise<Product[]>
  deleteProduct(id: string): Promise<void>

  // Product variants (the sellable unit — barcode hot path)
  saveVariant(variant: ProductVariant): Promise<void>
  findVariantById(id: string): Promise<ProductVariant | null>
  findVariantBySku(orgId: string, sku: string): Promise<ProductVariant | null>
  findVariantByBarcode(orgId: string, barcode: string): Promise<ProductVariant | null>
  listVariantsByProduct(productId: string): Promise<ProductVariant[]>
  listVariantsByOrg(orgId: string): Promise<ProductVariant[]>
  deleteVariant(id: string): Promise<void>

  // Price lists (effective-dated)
  savePriceList(priceList: PriceList): Promise<void>
  findPriceListById(id: string): Promise<PriceList | null>
  listPriceListsByOrg(orgId: string): Promise<PriceList[]>
  savePriceListEntry(entry: PriceListEntry): Promise<void>
  listPriceListEntries(priceListId: string): Promise<PriceListEntry[]>
  findEffectivePrice(orgId: string, variantId: string, atDate: Date): Promise<PriceListEntry | null>
}
