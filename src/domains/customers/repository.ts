import type { Customer } from '@domains/customers/entities/customer'
import type { StoreCreditTransaction } from '@domains/customers/entities/store-credit-transaction'

export interface CustomersRepository {
  save(customer: Customer): Promise<void>
  findById(id: string): Promise<Customer | null>
  findByEmail(email: string): Promise<Customer | null>
  findByPhone(phone: string): Promise<Customer | null>
  searchByName(query: string): Promise<Customer[]>
  saveStoreCreditTransaction(tx: StoreCreditTransaction): Promise<void>
  listStoreCreditTransactions(customerId: string): Promise<StoreCreditTransaction[]>
  listAll(): Promise<Customer[]>
}
