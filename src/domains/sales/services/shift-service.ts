import { SHIFT_STATUS } from '@constants/enums/shift-status'
import type { Shift } from '@domains/sales/entities/shift'
// eslint-disable-next-line boundaries/no-unknown
import type { SalesRepository } from '@domains/sales/repository'
import { ValidationError } from '@shared/errors'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'

export class ShiftService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
  ) {}

  async openShift(
    repos: { sales: SalesRepository },
    input: {
      orgId: string
      branchId: string
      registerId: string
      cashierUserId: string
      floatAmount: number
    },
  ): Promise<Shift> {
    // Check if there's already an open shift on this register
    const existing = await repos.sales.findOpenShiftForRegister(input.registerId)
    if (existing) {
      throw new ValidationError(
        `Register ${input.registerId} already has an open shift (${existing.id})`,
      )
    }

    const shift: Shift = {
      id: this.ids.next(),
      orgId: input.orgId,
      branchId: input.branchId,
      registerId: input.registerId,
      cashierUserId: input.cashierUserId,
      status: SHIFT_STATUS.OPEN,
      floatAmount: input.floatAmount,
      openedAt: this.clock.now(),
    }

    await repos.sales.saveShift(shift)
    return shift
  }

  async closeShift(
    repos: { sales: SalesRepository },
    input: {
      shiftId: string
      countedAmount: number
    },
  ): Promise<Shift> {
    const shift = await repos.sales.findShiftById(input.shiftId)
    if (!shift) {
      throw new ValidationError(`Shift ${input.shiftId} not found`)
    }

    if (shift.status !== SHIFT_STATUS.OPEN) {
      throw new ValidationError(`Shift ${input.shiftId} is not open (status: ${shift.status})`)
    }

    // Calculate expected amount: float + cash sales - cash refunds
    const sales = await repos.sales.listSalesByShift(input.shiftId)
    const payments = await Promise.all(
      sales.map((sale) =>
        repos.sales.listPaymentsForSale(sale.id).then((payments) => ({
          saleId: sale.id,
          payments,
        })),
      ),
    )

    let expectedCashAmount = shift.floatAmount
    for (const { payments: paymentList } of payments) {
      for (const payment of paymentList) {
        if (payment.method === 'cash' && payment.status === 'completed') {
          expectedCashAmount += payment.amount
        }
      }
    }

    const variance = input.countedAmount - expectedCashAmount

    const closedShift: Shift = {
      ...shift,
      status: SHIFT_STATUS.CLOSED,
      expectedAmount: expectedCashAmount,
      countedAmount: input.countedAmount,
      variance,
      closedAt: this.clock.now(),
    }

    await repos.sales.saveShift(closedShift)
    return closedShift
  }

  async getOpenShiftForRegister(
    repos: { sales: SalesRepository },
    registerId: string,
  ): Promise<Shift | null> {
    return repos.sales.findOpenShiftForRegister(registerId)
  }
}
