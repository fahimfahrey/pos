import { SalesService } from '@domains/sales/services/sales-service'
import { InventoryService } from '@domains/inventory/services/inventory-service'
import { DexieSalesRepository } from '@infra/repositories/dexie-sales-repository'
import { DexieInventoryRepository } from '@infra/repositories/dexie-inventory-repository'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'

const clock = new SystemClock()
const ids = new UuidIdGenerator()
const salesRepository = new DexieSalesRepository()
const inventoryRepository = new DexieInventoryRepository()

export const container = {
  salesService: new SalesService(salesRepository, clock, ids),
  inventoryService: new InventoryService(inventoryRepository, clock, ids),
}
