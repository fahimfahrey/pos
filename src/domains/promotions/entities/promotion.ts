export type PromotionKind = 'percentage_discount' | 'fixed_discount' | 'buy_x_get_y' | 'free_shipping'

export interface Promotion {
  id: string
  code: string
  kind: PromotionKind
  value: number
  currency?: string
  active: boolean
  validFrom: Date
  validTo: Date
  maxUsages?: number
  usageCount: number
  createdAt: Date
  updatedAt: Date
}
