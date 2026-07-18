export interface PriceList {
  id: string
  orgId: string
  name: string
  description?: string
  effectiveFrom: Date
  effectiveTo?: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PriceListEntry {
  id: string
  priceListId: string
  variantId: string
  price: number
  createdAt: Date
  updatedAt: Date
}
