export type StoreCreditTransactionType = 'redemption' | 'issuance' | 'adjustment'

export interface StoreCreditTransaction {
  id: string
  customerId: string
  type: StoreCreditTransactionType
  amount: number
  balanceAfter: number
  reference?: string
  createdAt: Date
  createdBy: string
}
