import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import type { LoyaltyTransaction } from '@domains/customers/entities/loyalty-transaction'
import type { CustomersRepository } from '@domains/customers/repository'
import type { LoyaltyRules } from '@domains/organization/entities/settings'
import { InsufficientLoyaltyPointsError } from '../errors'

export class LoyaltyService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
  ) {}

  async accrue(
    repos: { customers: CustomersRepository },
    input: { customerId: string; points: number; saleId?: string; reference?: string; createdBy: string },
  ): Promise<{ transaction: LoyaltyTransaction }> {
    return this.applyTransaction(repos, {
      ...input,
      points: Math.abs(input.points),
      type: 'accrual',
    })
  }

  async redeem(
    repos: { customers: CustomersRepository },
    input: { customerId: string; points: number; saleId?: string; reference?: string; createdBy: string },
  ): Promise<{ transaction: LoyaltyTransaction }> {
    return this.applyTransaction(repos, {
      ...input,
      points: -Math.abs(input.points),
      type: 'redemption',
    })
  }

  private async applyTransaction(
    repos: { customers: CustomersRepository },
    input: {
      customerId: string
      points: number
      type: 'accrual' | 'redemption' | 'adjustment'
      saleId?: string
      reference?: string
      createdBy: string
    },
  ): Promise<{ transaction: LoyaltyTransaction }> {
    const customer = await repos.customers.findById(input.customerId)
    if (!customer) {
      throw new Error(`Customer ${input.customerId} not found`)
    }

    const newBalance = customer.loyaltyPointsBalance + input.points

    if (newBalance < 0) {
      throw new InsufficientLoyaltyPointsError(
        `Insufficient loyalty points: have ${customer.loyaltyPointsBalance}, need ${Math.abs(input.points)}`,
      )
    }

    const updated = {
      ...customer,
      loyaltyPointsBalance: newBalance,
      updatedAt: this.clock.now(),
    }

    await repos.customers.save(updated)

    const transaction: LoyaltyTransaction = {
      id: this.ids.generate(),
      customerId: input.customerId,
      type: input.type,
      points: input.points,
      balanceAfter: newBalance,
      saleId: input.saleId,
      reference: input.reference,
      createdAt: this.clock.now(),
      createdBy: input.createdBy,
    }

    await repos.customers.saveLoyaltyTransaction(transaction)

    return { transaction }
  }
}

export function resolveEarnedPoints(loyalty: LoyaltyRules, subtotal: number): number {
  if (!loyalty.enabled) {
    return 0
  }
  return Math.floor(subtotal * (loyalty.pointsPerDollar ?? 0))
}

export function pointsToAmount(loyalty: LoyaltyRules, points: number): number {
  return points * (loyalty.redemptionValuePerPoint ?? 0)
}
