export type LoyaltyTransactionType = 'accrual' | 'redemption' | 'adjustment'

export interface LoyaltyTransaction {
  id: string
  customerId: string
  type: LoyaltyTransactionType
  points: number
  balanceAfter: number
  saleId?: string
  reference?: string
  createdAt: Date
  createdBy: string
}
