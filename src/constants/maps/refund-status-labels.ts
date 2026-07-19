import { REFUND_STATUS, type RefundStatus } from '@constants/enums/refund-status'

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  [REFUND_STATUS.PENDING]: 'Pending',
  [REFUND_STATUS.COMPLETED]: 'Completed',
  [REFUND_STATUS.FAILED]: 'Failed',
}
