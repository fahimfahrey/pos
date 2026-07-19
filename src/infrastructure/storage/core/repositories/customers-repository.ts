// eslint-disable-next-line boundaries/no-unknown
import type { CustomersRepository } from '@domains/customers/repository'
 
import type { Customer } from '@domains/customers/entities/customer'
import type { StoreCreditTransaction } from '@domains/customers/entities/store-credit-transaction'
import type { LoyaltyTransaction } from '@domains/customers/entities/loyalty-transaction'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreCustomersRepository implements CustomersRepository {
  private collection: Collection<Customer>
  private storeCreditTransactionCollection: Collection<StoreCreditTransaction>
  private loyaltyTransactionCollection: Collection<LoyaltyTransaction>

  constructor(tx: DriverTransaction) {
    this.collection = new Collection<Customer>(tx, 'customers')
    this.storeCreditTransactionCollection = new Collection<StoreCreditTransaction>(tx, 'storeCreditTransactions')
    this.loyaltyTransactionCollection = new Collection<LoyaltyTransaction>(tx, 'loyaltyTransactions')
  }

  async save(customer: Customer): Promise<void> {
    await this.collection.put(customer)
  }

  async findById(id: string): Promise<Customer | null> {
    return (await this.collection.get(id)) ?? null
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.collection.find((c) => c.email === email)
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return this.collection.find((c) => c.phone === phone)
  }

  async searchByName(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase()
    return this.collection.filter(
      (c) =>
        c.firstName.toLowerCase().includes(lowerQuery) ||
        c.lastName.toLowerCase().includes(lowerQuery),
    )
  }

  async listAll(): Promise<Customer[]> {
    return this.collection.getAll()
  }

  async saveStoreCreditTransaction(tx: StoreCreditTransaction): Promise<void> {
    await this.storeCreditTransactionCollection.put(tx)
  }

  async listStoreCreditTransactions(customerId: string): Promise<StoreCreditTransaction[]> {
    return this.storeCreditTransactionCollection.filter((t) => t.customerId === customerId)
  }

  async saveLoyaltyTransaction(tx: LoyaltyTransaction): Promise<void> {
    await this.loyaltyTransactionCollection.put(tx)
  }

  async listLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    return this.loyaltyTransactionCollection.filter((t) => t.customerId === customerId)
  }

  async listByOrg(orgId: string): Promise<Customer[]> {
    return this.collection.filter((c) => c.orgId === orgId)
  }
}
