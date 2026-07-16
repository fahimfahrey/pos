import { ORDER_STATUS, type OrderStatus } from '@constants/enums/order-status'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.DRAFT]: 'Draft',
  [ORDER_STATUS.OPEN]: 'Open',
  [ORDER_STATUS.PAID]: 'Paid',
  [ORDER_STATUS.VOID]: 'Voided',
}
