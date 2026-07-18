export const STOCK_MOVEMENT_TYPE = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  RETURN: 'return',
  STOCKTAKE: 'stocktake',
} as const

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPE)[keyof typeof STOCK_MOVEMENT_TYPE]
