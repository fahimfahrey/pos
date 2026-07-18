// eslint-disable-next-line boundaries/no-unknown
import type { CatalogRepository } from '../repository'
// eslint-disable-next-line boundaries/no-unknown
import type { ProductVariant } from '../entities/product-variant'
// eslint-disable-next-line boundaries/no-unknown
import type { Product } from '../entities/product'

export interface VariantListPage {
  items: Array<ProductVariant & { product?: Product }>
  total: number
  page: number
  pageSize: number
}

export class CatalogQueryService {
  constructor(private repo: CatalogRepository) {}

  async listVariantsPage(
    orgId: string,
    options: {
      page?: number
      pageSize?: number
      query?: string
      categoryId?: string
    },
  ): Promise<VariantListPage> {
    const pageSize = options.pageSize || 20
    const page = options.page || 1
    const offset = (page - 1) * pageSize

    let variants = await this.repo.listVariantsByOrg(orgId)

    if (options.categoryId) {
      const categoryVariants = new Set<string>()
      const products = await this.repo.listProductsByOrg(orgId)
      products
        .filter((p) => p.categoryId === options.categoryId)
        .forEach((p) => {
          const variantsInProduct = variants.filter((v) => v.productId === p.id)
          variantsInProduct.forEach((v) => categoryVariants.add(v.id))
        })
      variants = variants.filter((v) => categoryVariants.has(v.id))
    }

    if (options.query) {
      const lowerQuery = options.query.toLowerCase()
      variants = variants.filter(
        (v) =>
          v.sku.toLowerCase().includes(lowerQuery) ||
          v.barcode?.toLowerCase().includes(lowerQuery) ||
          v.name?.toLowerCase().includes(lowerQuery),
      )
    }

    const total = variants.length
    const items = variants.slice(offset, offset + pageSize)

    // Fetch product details for each variant
    const productMap = new Map<string, Product>()
    for (const variant of items) {
      if (!productMap.has(variant.productId)) {
        const product = await this.repo.findProductById(variant.productId)
        if (product) productMap.set(variant.productId, product)
      }
    }

    const enrichedItems = items.map((v) => ({
      ...v,
      product: productMap.get(v.productId),
    }))

    return {
      items: enrichedItems,
      total,
      page,
      pageSize,
    }
  }

  async resolveEffectivePrice(
    orgId: string,
    variantId: string,
    atDate?: Date,
  ): Promise<number | null> {
    const date = atDate || new Date()
    const entry = await this.repo.findEffectivePrice(orgId, variantId, date)
    return entry?.price ?? null
  }
}
