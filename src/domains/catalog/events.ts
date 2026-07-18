export type CatalogEvent =
  | { type: 'product.created'; productId: string; orgId: string }
  | { type: 'product.updated'; productId: string; orgId: string }
  | { type: 'product.deleted'; productId: string; orgId: string }
  | { type: 'variant.created'; variantId: string; orgId: string }
  | { type: 'variant.updated'; variantId: string; orgId: string }
  | { type: 'variant.deleted'; variantId: string; orgId: string }
  | { type: 'category.created'; categoryId: string; orgId: string }
  | { type: 'category.updated'; categoryId: string; orgId: string }
  | { type: 'category.deleted'; categoryId: string; orgId: string }
  | { type: 'pricelist.created'; priceListId: string; orgId: string }
  | { type: 'pricelist.updated'; priceListId: string; orgId: string }
  | { type: 'pricelist.deleted'; priceListId: string; orgId: string }
