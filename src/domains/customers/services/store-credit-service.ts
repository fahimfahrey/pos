import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import type { StoreCreditTransaction } from '@domains/customers/entities/store-credit-transaction'
import type { CustomersRepository } from '@domains/customers/repository'
import { InsufficientStoreCreditError } from '../errors'

export class StoreCreditService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
  ) {}

  async redeem(
    repos: { customers: CustomersRepository },
    input: { customerId: string; amount: number; reference?: string; createdBy: string },
  ): Promise<{ customer: any; transaction: StoreCreditTransaction }> {
    return this.applyTransaction(repos, {
      ...input,
      amount: -Math.abs(input.amount),
      type: 'redemption',
    })
  }

  async issue(
    repos: { customers: CustomersRepository },
    input: { customerId: string; amount: number; reference?: string; createdBy: string },
  ): Promise<{ customer: any; transaction: StoreCreditTransaction }> {
    return this.applyTransaction(repos, {
      ...input,
      amount: Math.abs(input.amount),
      type: 'issuance',
    })
  }

  private async applyTransaction(
    repos: { customers: CustomersRepository },
    input: {
      customerId: string
      amount: number
      type: 'redemption' | 'issuance' | 'adjustment'
      reference?: string
      createdBy: string
    },
  ): Promise<{ customer: any; transaction: StoreCreditTransaction }> {
    const customer = await repos.customers.findById(input.customerId)
    if (!customer) {
      throw new Error(`Customer ${input.customerId} not found`)
    }

    const newBalance = customer.storeCreditBalance + input.amount

    if (newBalance < 0) {
      throw new InsufficientStoreCreditError(
        `Insufficient store credit: have ${customer.storeCreditBalance}, need ${Math.abs(input.amount)}`,
      )
    }

    const updated = {
      ...customer,
      storeCreditBalance: newBalance,
      updatedAt: this.clock.now(),
    }

    await repos.customers.save(updated)

    const transaction: StoreCreditTransaction = {
      id: this.ids.generate(),
      customerId: input.customerId,
      type: input.type,
      amount: input.amount,
      balanceAfter: newBalance,
      reference: input.reference,
      createdAt: this.clock.now(),
      createdBy: input.createdBy,
    }

    await repos.customers.saveStoreCreditTransaction(transaction)

    return { customer: updated, transaction }
  }
}
