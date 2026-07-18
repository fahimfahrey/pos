// eslint-disable-next-line boundaries/no-unknown
import type { CatalogRepository } from '../repository'
// eslint-disable-next-line boundaries/no-unknown
import type { Category } from '../entities/category'
// eslint-disable-next-line boundaries/no-unknown
import type { Product } from '../entities/product'
// eslint-disable-next-line boundaries/no-unknown
import type { ProductVariant } from '../entities/product-variant'
// eslint-disable-next-line boundaries/no-unknown
import type { PriceList } from '../entities/price-list'
// eslint-disable-next-line boundaries/no-unknown
import type { Clock } from '@shared/ports/clock'
// eslint-disable-next-line boundaries/no-unknown
import type { IdGenerator } from '@shared/ports/id-generator'

import { ConflictError } from '@shared/errors'
import type { EventBus } from '@shared/ports/event-bus'
import type { CatalogEvent } from '../events'

export class CatalogService {
  constructor(
    private repo: CatalogRepository,
    private idGen: IdGenerator,
    private clock: Clock,
    private eventBus: EventBus<CatalogEvent>,
  ) {}

  async createCategory(input: {
    orgId: string
    name: string
    description?: string
  }): Promise<Category> {
    const category: Category = {
      id: this.idGen.next(),
      orgId: input.orgId,
      name: input.name,
      description: input.description,
      active: true,
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }
    await this.repo.saveCategory(category)
    this.eventBus.publish({ type: 'category.created', categoryId: category.id, orgId: input.orgId })
    return category
  }

  async updateCategory(id: string, input: { name?: string; description?: string }): Promise<Category> {
    const existing = await this.repo.findCategoryById(id)
    if (!existing) throw new Error('Category not found')

    const updated = {
      ...existing,
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      updatedAt: this.clock.now(),
    }
    await this.repo.saveCategory(updated)
    this.eventBus.publish({
      type: 'category.updated',
      categoryId: id,
      orgId: existing.orgId,
    })
    return updated
  }

  async createProduct(input: {
    orgId: string
    categoryId: string
    name: string
    description?: string
    imageFileId?: string
  }): Promise<Product> {
    const product: Product = {
      id: this.idGen.next(),
      orgId: input.orgId,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      imageFileId: input.imageFileId,
      active: true,
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }
    await this.repo.saveProduct(product)
    this.eventBus.publish({ type: 'product.created', productId: product.id, orgId: input.orgId })
    return product
  }

  async updateProduct(
    id: string,
    input: { name?: string; description?: string; imageFileId?: string; categoryId?: string },
  ): Promise<Product> {
    const existing = await this.repo.findProductById(id)
    if (!existing) throw new Error('Product not found')

    const updated = {
      ...existing,
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      imageFileId: input.imageFileId ?? existing.imageFileId,
      categoryId: input.categoryId ?? existing.categoryId,
      updatedAt: this.clock.now(),
    }
    await this.repo.saveProduct(updated)
    this.eventBus.publish({ type: 'product.updated', productId: id, orgId: existing.orgId })
    return updated
  }

  async createVariant(input: {
    orgId: string
    productId: string
    sku: string
    barcode?: string
    name?: string
    unitOfMeasure: string
    barcodeSymbology?: string
    isDecimalQuantity: boolean
  }): Promise<ProductVariant> {
    const existing = await this.repo.findVariantBySku(input.orgId, input.sku)
    if (existing) throw new ConflictError(`SKU "${input.sku}" already exists`)

    if (input.barcode) {
      const byBarcode = await this.repo.findVariantByBarcode(input.orgId, input.barcode)
      if (byBarcode) throw new ConflictError(`Barcode "${input.barcode}" already exists`)
    }

    const variant: ProductVariant = {
      id: this.idGen.next(),
      orgId: input.orgId,
      productId: input.productId,
      sku: input.sku,
      barcode: input.barcode,
      name: input.name,
      unitOfMeasure: input.unitOfMeasure,
      barcodeSymbology: input.barcodeSymbology,
      isDecimalQuantity: input.isDecimalQuantity,
      active: true,
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }
    await this.repo.saveVariant(variant)
    this.eventBus.publish({ type: 'variant.created', variantId: variant.id, orgId: input.orgId })
    return variant
  }

  async updateVariant(
    id: string,
    input: { name?: string; barcode?: string; unitOfMeasure?: string; isDecimalQuantity?: boolean },
  ): Promise<ProductVariant> {
    const existing = await this.repo.findVariantById(id)
    if (!existing) throw new Error('Variant not found')

    if (input.barcode && input.barcode !== existing.barcode) {
      const byBarcode = await this.repo.findVariantByBarcode(existing.orgId, input.barcode)
      if (byBarcode) throw new ConflictError(`Barcode "${input.barcode}" already exists`)
    }

    const updated = {
      ...existing,
      name: input.name ?? existing.name,
      barcode: input.barcode ?? existing.barcode,
      unitOfMeasure: input.unitOfMeasure ?? existing.unitOfMeasure,
      isDecimalQuantity: input.isDecimalQuantity ?? existing.isDecimalQuantity,
      updatedAt: this.clock.now(),
    }
    await this.repo.saveVariant(updated)
    this.eventBus.publish({ type: 'variant.updated', variantId: id, orgId: existing.orgId })
    return updated
  }

  async createPriceList(input: {
    orgId: string
    name: string
    description?: string
    effectiveFrom: Date
    effectiveTo?: Date
  }): Promise<PriceList> {
    const priceList: PriceList = {
      id: this.idGen.next(),
      orgId: input.orgId,
      name: input.name,
      description: input.description,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      active: true,
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }
    await this.repo.savePriceList(priceList)
    this.eventBus.publish({ type: 'pricelist.created', priceListId: priceList.id, orgId: input.orgId })
    return priceList
  }
}
