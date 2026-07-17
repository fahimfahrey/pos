import type { Customer } from '@domains/customers/entities/customer'

export interface CustomersRepository {
  save(customer: Customer): Promise<void>
  findById(id: string): Promise<Customer | null>
  findByEmail(email: string): Promise<Customer | null>
  findByPhone(phone: string): Promise<Customer | null>
  searchByName(query: string): Promise<Customer[]>
  listAll(): Promise<Customer[]>
}
