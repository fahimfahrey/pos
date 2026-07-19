// eslint-disable-next-line boundaries/no-unknown
import type { CatalogRepository } from '@domains/catalog/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { SalesRepository } from '@domains/sales/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { PaymentsRepository } from '@domains/payments/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { CustomersRepository } from '@domains/customers/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { PurchasingRepository } from '@domains/purchasing/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { PromotionsRepository } from '@domains/promotions/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { OrganizationRepository } from '@domains/organization/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { AuthRepository } from '@domains/auth/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { AuditRepository } from '@domains/audit/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { SystemEnumValueRepository } from '@domains/system-enums/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { ReportingRepository } from '@domains/reporting/repository'

export interface RepositorySet {
  catalog: CatalogRepository
  inventory: InventoryRepository
  sales: SalesRepository
  payments: PaymentsRepository
  customers: CustomersRepository
  purchasing: PurchasingRepository
  promotions: PromotionsRepository
  organization: OrganizationRepository
  auth: AuthRepository
  audit: AuditRepository
  systemEnums: SystemEnumValueRepository
  reporting: ReportingRepository
}

export interface RepositoryContext {
  catalog: CatalogRepository
  inventory: InventoryRepository
  sales: SalesRepository
  payments: PaymentsRepository
  customers: CustomersRepository
  purchasing: PurchasingRepository
  promotions: PromotionsRepository
  organization: OrganizationRepository
  auth: AuthRepository
  audit: AuditRepository
  systemEnums: SystemEnumValueRepository
  reporting: ReportingRepository
}
