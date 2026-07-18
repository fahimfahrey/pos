import { STOCK_MOVEMENT_TYPE, type StockMovementType } from '@constants/enums/stock-movement-type'

export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  [STOCK_MOVEMENT_TYPE.PURCHASE]: 'Purchase',
  [STOCK_MOVEMENT_TYPE.SALE]: 'Sale',
  [STOCK_MOVEMENT_TYPE.ADJUSTMENT]: 'Adjustment',
  [STOCK_MOVEMENT_TYPE.TRANSFER]: 'Transfer',
  [STOCK_MOVEMENT_TYPE.RETURN]: 'Return',
  [STOCK_MOVEMENT_TYPE.STOCKTAKE]: 'Stocktake',
}
