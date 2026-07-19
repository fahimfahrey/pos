export interface PromotionRedemption {
  id: string
  orgId: string
  promotionId: string
  saleId: string
  customerId?: string
  discountAmount: number
  appliedAt: Date
}
