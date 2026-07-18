import { SHIFT_STATUS, type ShiftStatus } from '@constants/enums/shift-status'

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  [SHIFT_STATUS.OPEN]: 'Open',
  [SHIFT_STATUS.CLOSED]: 'Closed',
}
