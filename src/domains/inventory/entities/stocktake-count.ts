export interface StocktakeCount {
  id: string
  sessionId: string
  variantId: string
  countedQuantity: number
  expectedQuantityAtCount: number
  countedBy: string
  countedAt: Date
}
