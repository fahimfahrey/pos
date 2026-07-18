import { STOCK_MOVEMENT_TYPE, type StockMovementType } from '@constants/enums/stock-movement-type'

export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  [STOCK_MOVEMENT_TYPE.IN]: 'In',
  [STOCK_MOVEMENT_TYPE.OUT]: 'Out',
  [STOCK_MOVEMENT_TYPE.ADJUSTMENT]: 'Adjustment',
}
