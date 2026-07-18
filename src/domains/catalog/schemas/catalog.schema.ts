import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const productSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  imageFileId: z.string().optional(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const productVariantSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  productId: z.string().min(1),
  sku: z.string().min(1).max(50),
  barcode: z.string().max(50).optional(),
  name: z.string().max(255).optional(),
  unitOfMeasure: z.string().min(1),
  barcodeSymbology: z.enum(['ean13', 'code128']).optional(),
  isDecimalQuantity: z.boolean(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const priceListSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const priceListEntrySchema = z.object({
  id: z.string().min(1),
  priceListId: z.string().min(1),
  variantId: z.string().min(1),
  price: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const csvRowSchema = z.object({
  productName: z.string().min(1),
  categoryName: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  unitOfMeasure: z.string().min(1),
  isDecimalQuantity: z.enum(['true', 'false']).transform((v) => v === 'true'),
  description: z.string().optional(),
})

export type Category = z.infer<typeof categorySchema>
export type Product = z.infer<typeof productSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type PriceList = z.infer<typeof priceListSchema>
export type PriceListEntry = z.infer<typeof priceListEntrySchema>
export type CsvRow = z.infer<typeof csvRowSchema>
