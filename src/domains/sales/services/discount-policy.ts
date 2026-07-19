import { DISCOUNT_TYPE, type DiscountType } from '@constants/enums/discount-type'
import type { DiscountLimits } from '@domains/organization/entities/settings'
import { ForbiddenError } from '@shared/errors'

export interface DiscountPolicyInput {
  type: DiscountType
  amount: number
  lineOrCartSubtotal: number
}

export interface ManagerOverrideToken {
  approvedBy: string
  expiresAt: Date
}

export class DiscountPolicyService {
  isWithinCashierLimit(
    input: DiscountPolicyInput,
    limits: DiscountLimits,
    override?: ManagerOverrideToken,
  ): boolean {
    const discountAmount = this.calculateDiscountAmount(input)

    if (input.type === DISCOUNT_TYPE.PERCENTAGE) {
      return discountAmount <= limits.cashierMaxPercent
    } else {
      return discountAmount <= limits.cashierMaxFixedAmount
    }
  }

  validateDiscount(
    input: DiscountPolicyInput,
    limits: DiscountLimits,
    override?: ManagerOverrideToken,
  ): void {
    const discountAmount = this.calculateDiscountAmount(input)

    if (input.type === DISCOUNT_TYPE.PERCENTAGE) {
      if (discountAmount > limits.cashierMaxPercent) {
        if (!override || new Date() > override.expiresAt) {
          throw new ForbiddenError(
            `Discount percentage ${discountAmount}% exceeds cashier limit of ${limits.cashierMaxPercent}%`,
          )
        }
      }
    } else {
      if (discountAmount > limits.cashierMaxFixedAmount) {
        if (!override || new Date() > override.expiresAt) {
          throw new ForbiddenError(
            `Discount amount $${discountAmount.toFixed(2)} exceeds cashier limit of $${limits.cashierMaxFixedAmount.toFixed(2)}`,
          )
        }
      }
    }
  }

  private calculateDiscountAmount(input: DiscountPolicyInput): number {
    if (input.type === DISCOUNT_TYPE.PERCENTAGE) {
      return input.amount
    } else {
      return input.amount
    }
  }
}
