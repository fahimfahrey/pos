import { SHIFT_STATUS, type ShiftStatus } from '@constants/enums/shift-status'

export { SHIFT_STATUS }
export type { ShiftStatus }

export interface Shift {
  id: string
  orgId: string
  branchId: string
  registerId: string
  cashierUserId: string
  status: ShiftStatus
  floatAmount: number
  expectedAmount?: number
  countedAmount?: number
  variance?: number
  openedAt: Date
  closedAt?: Date
}
