import type { RepositorySet } from '../repository-set'
import type { DriverTransaction } from '../driver'
import { CoreCatalogRepository } from './catalog-repository'
import { CoreInventoryRepository } from './inventory-repository'
import { CoreSalesRepository } from './sales-repository'
import { CorePaymentsRepository } from './payments-repository'
import { CoreCustomersRepository } from './customers-repository'
import { CorePurchasingRepository } from './purchasing-repository'
import { CorePromotionsRepository } from './promotions-repository'
import { CoreOrganizationRepository } from './organization-repository'
import { CoreAuthRepository } from './auth-repository'
import { CoreAuditRepository } from './audit-repository'
import { CoreSystemEnumValueRepository } from './system-enum-repository'
import { CoreReportingRepository } from './reporting-repository'

export function buildRepositorySet(tx: DriverTransaction): RepositorySet {
  return {
    catalog: new CoreCatalogRepository(tx),
    inventory: new CoreInventoryRepository(tx),
    sales: new CoreSalesRepository(tx),
    payments: new CorePaymentsRepository(tx),
    customers: new CoreCustomersRepository(tx),
    purchasing: new CorePurchasingRepository(tx),
    promotions: new CorePromotionsRepository(tx),
    organization: new CoreOrganizationRepository(tx),
    auth: new CoreAuthRepository(tx),
    audit: new CoreAuditRepository(tx),
    systemEnums: new CoreSystemEnumValueRepository(tx),
    reporting: new CoreReportingRepository(tx),
  }
}
