export const STOCKTAKE_STATUS = {
  OPEN: 'open',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
} as const

export type StocktakeStatus = (typeof STOCKTAKE_STATUS)[keyof typeof STOCKTAKE_STATUS]
