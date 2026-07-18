import type { Product } from '@domains/inventory/entities/product'
import type { StockMovement } from '@domains/inventory/entities/stock-movement'
import type { StockLevel } from '@domains/inventory/entities/stock-level'
import type { StocktakeSession } from '@domains/inventory/entities/stocktake-session'
import type { StocktakeCount } from '@domains/inventory/entities/stocktake-count'

export interface InventoryRepository {
  // Legacy generic fixture (unchanged, used only by conformance CRUD/ULID/tenant/UoW/export suites)
  save(product: Product): Promise<void>
  findById(id: string): Promise<Product | null>
  listAll(): Promise<Product[]>
  findBySku(sku: string): Promise<Product | null>

  // Stock levels (materialized)
  findStockLevel(branchId: string, variantId: string): Promise<StockLevel | null>
  saveStockLevel(level: StockLevel): Promise<void>
  listStockLevelsByBranch(branchId: string): Promise<StockLevel[]>
  listLowStock(branchId: string): Promise<StockLevel[]>

  // Stock movements (ledger)
  appendMovement(movement: StockMovement): Promise<void>
  listMovementsForVariant(orgId: string, branchId: string, variantId: string): Promise<StockMovement[]>
  listMovementsForBranch(orgId: string, branchId: string): Promise<StockMovement[]>

  // Stocktake
  saveStocktakeSession(session: StocktakeSession): Promise<void>
  findStocktakeSessionById(id: string): Promise<StocktakeSession | null>
  listStocktakeSessionsByBranch(branchId: string): Promise<StocktakeSession[]>
  saveStocktakeCount(count: StocktakeCount): Promise<void>
  listStocktakeCounts(sessionId: string): Promise<StocktakeCount[]>
}
