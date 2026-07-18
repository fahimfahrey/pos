// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'
import type { Product } from '@domains/inventory/entities/product'
import type { StockMovement } from '@domains/inventory/entities/stock-movement'
import type { StockLevel } from '@domains/inventory/entities/stock-level'
import type { StocktakeSession } from '@domains/inventory/entities/stocktake-session'
import type { StocktakeCount } from '@domains/inventory/entities/stocktake-count'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreInventoryRepository implements InventoryRepository {
  private productCollection: Collection<Product>
  private movementCollection: Collection<StockMovement>
  private levelCollection: Collection<StockLevel>
  private sessionCollection: Collection<StocktakeSession>
  private countCollection: Collection<StocktakeCount>

  constructor(tx: DriverTransaction) {
    this.productCollection = new Collection<Product>(tx, 'products')
    this.movementCollection = new Collection<StockMovement>(tx, 'stockMovements')
    this.levelCollection = new Collection<StockLevel>(tx, 'stockLevels')
    this.sessionCollection = new Collection<StocktakeSession>(tx, 'stocktakeSessions')
    this.countCollection = new Collection<StocktakeCount>(tx, 'stocktakeCounts')
  }

  async save(product: Product): Promise<void> {
    await this.productCollection.put(product)
  }

  async findById(id: string): Promise<Product | null> {
    return (await this.productCollection.get(id)) ?? null
  }

  async listAll(): Promise<Product[]> {
    return this.productCollection.getAll()
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productCollection.find((p) => p.sku === sku)
  }

  async findStockLevel(branchId: string, variantId: string): Promise<StockLevel | null> {
    return this.levelCollection.find((l) => l.branchId === branchId && l.variantId === variantId)
  }

  async saveStockLevel(level: StockLevel): Promise<void> {
    await this.levelCollection.put(level)
  }

  async listStockLevelsByBranch(branchId: string): Promise<StockLevel[]> {
    return this.levelCollection.filter((l) => l.branchId === branchId)
  }

  async listLowStock(branchId: string): Promise<StockLevel[]> {
    return this.levelCollection.filter(
      (l) => l.branchId === branchId && l.reorderThreshold != null && l.quantity <= l.reorderThreshold,
    )
  }

  async appendMovement(movement: StockMovement): Promise<void> {
    await this.movementCollection.put(movement)
  }

  async listMovementsForVariant(
    orgId: string,
    branchId: string,
    variantId: string,
  ): Promise<StockMovement[]> {
    return this.movementCollection.filter(
      (m) => m.orgId === orgId && m.branchId === branchId && m.variantId === variantId,
    )
  }

  async listMovementsForBranch(orgId: string, branchId: string): Promise<StockMovement[]> {
    return this.movementCollection.filter((m) => m.orgId === orgId && m.branchId === branchId)
  }

  async saveStocktakeSession(session: StocktakeSession): Promise<void> {
    await this.sessionCollection.put(session)
  }

  async findStocktakeSessionById(id: string): Promise<StocktakeSession | null> {
    return (await this.sessionCollection.get(id)) ?? null
  }

  async listStocktakeSessionsByBranch(branchId: string): Promise<StocktakeSession[]> {
    return this.sessionCollection.filter((s) => s.branchId === branchId)
  }

  async saveStocktakeCount(count: StocktakeCount): Promise<void> {
    await this.countCollection.put(count)
  }

  async listStocktakeCounts(sessionId: string): Promise<StocktakeCount[]> {
    return this.countCollection.filter((c) => c.sessionId === sessionId)
  }
}
