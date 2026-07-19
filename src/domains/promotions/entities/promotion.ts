export type PromotionKind = 'percentage_discount' | 'fixed_discount' | 'buy_x_get_y' | 'free_shipping' | 'combo' | 'happy_hour'
export type DiscountType = 'percentage' | 'fixed_amount'

export interface PromotionComboLine {
  variantId: string
  quantity: number
}

export interface PromotionTimeWindow {
  startTime: string // HH:MM
  endTime: string // HH:MM
  daysOfWeek: string[] // 'Mon', 'Tue', etc.
}

export interface Promotion {
  id: string
  orgId: string
  code?: string
  kind: PromotionKind
  value: number
  currency?: string
  active: boolean
  requiresCode: boolean
  stackable: boolean
  priority: number
  validFrom: Date
  validTo: Date
  maxUsages?: number
  usageCount: number
  comboLines?: PromotionComboLine[]
  comboDiscountType?: DiscountType
  activeWindow?: PromotionTimeWindow
  timezone?: string
  createdAt: Date
  updatedAt: Date
}
