import { Collection } from './collection'
import type { DriverTransaction, CollectionName } from './driver'
import type { StorageDriver } from './driver'
import { COLLECTIONS, CURRENT_SCHEMA_VERSION } from './schema'
import { MigrationError } from './errors'

export interface MigrationContext {
  collection<T extends { id: string }>(name: CollectionName): Collection<T>
  createCollection(name: CollectionName): Promise<void>
}

export interface SchemaStep {
  version: number
  description: string
  migrate(ctx: MigrationContext): Promise<void>
  down?(ctx: MigrationContext): Promise<void>
}

class InternalMigrationContext implements MigrationContext {
  constructor(private tx: DriverTransaction) {}

  collection<T extends { id: string }>(name: CollectionName): Collection<T> {
    return new Collection<T>(this.tx, name)
  }

  async createCollection(_name: CollectionName): Promise<void> {
    // In-memory and most drivers don't need explicit collection creation
    // as they create collections on first use
  }
}

export const schemaSteps: SchemaStep[] = [
  {
    version: 1,
    description: 'Initialize all base collections',
    async migrate(ctx: MigrationContext) {
      // Collections are created implicitly on first use in most drivers
      // This step exists as a placeholder for any baseline setup
      const allCollections = Object.keys(COLLECTIONS)
      for (const name of allCollections) {
        await ctx.createCollection(name as CollectionName)
      }
    },
  },
  {
    version: 2,
    description: 'Introduce organization/branch/membership/invite collections',
    async migrate(ctx: MigrationContext) {
      // Structural changes: new collections created implicitly on first use
      // Collections: organizations, branches, memberships, branchAssignments, invites
      // Removed: stores, organizationSettings
      // Modified: registers now use branchId instead of storeId
      const newCollections: CollectionName[] = ['organizations', 'branches', 'memberships', 'branchAssignments', 'invites']
      for (const name of newCollections) {
        await ctx.createCollection(name)
      }
    },
  },
  {
    version: 3,
    description: 'Introduce systemEnumValues collection for org-level runtime enum extensibility',
    async migrate(ctx: MigrationContext) {
      await ctx.createCollection('systemEnumValues' as CollectionName)
    },
  },
  {
    version: 4,
    description: 'Replace catalogItems with products/productVariants/priceLists/priceListEntries, add orgId to categories',
    async migrate(ctx: MigrationContext) {
      // New collections: catalogProducts, catalogProductVariants, priceLists, priceListEntries
      await ctx.createCollection('catalogProducts' as CollectionName)
      await ctx.createCollection('catalogProductVariants' as CollectionName)
      await ctx.createCollection('priceLists' as CollectionName)
      await ctx.createCollection('priceListEntries' as CollectionName)
    },
  },
  {
    version: 5,
    description: 'Add stock levels, stocktake sessions/counts, and reindex stock movements',
    async migrate(ctx: MigrationContext) {
      // New collections: stockLevels, stocktakeSessions, stocktakeCounts
      await ctx.createCollection('stockLevels' as CollectionName)
      await ctx.createCollection('stocktakeSessions' as CollectionName)
      await ctx.createCollection('stocktakeCounts' as CollectionName)
    },
  },
  {
    version: 6,
    description: 'Replace orders/orderLines with sales/saleItems/shifts/parkedCarts/receiptCounters',
    async migrate(ctx: MigrationContext) {
      // New collections: sales, saleItems, shifts, parkedCarts, receiptCounters
      await ctx.createCollection('sales' as CollectionName)
      await ctx.createCollection('saleItems' as CollectionName)
      await ctx.createCollection('shifts' as CollectionName)
      await ctx.createCollection('parkedCarts' as CollectionName)
      await ctx.createCollection('receiptCounters' as CollectionName)
    },
  },
  {
    version: 7,
    description: 'Add payment status ledger, store credit ledger',
    async migrate(ctx: MigrationContext) {
      // New collections: paymentStatusEvents, storeCreditTransactions
      await ctx.createCollection('paymentStatusEvents' as CollectionName)
      await ctx.createCollection('storeCreditTransactions' as CollectionName)
    },
  },
  {
    version: 8,
    description: 'Introduce loyaltyTransactions, promotionRedemptions, goodsReceipts collections',
    async migrate(ctx: MigrationContext) {
      await ctx.createCollection('loyaltyTransactions' as CollectionName)
      await ctx.createCollection('promotionRedemptions' as CollectionName)
      await ctx.createCollection('goodsReceipts' as CollectionName)
    },
  },
  {
    version: 9,
    description: 'Introduce zReports collection for immutable shift Z-reports',
    async migrate(ctx: MigrationContext) {
      await ctx.createCollection('zReports' as CollectionName)
    },
  },
]

export class SchemaVersioner {
  constructor(private steps: SchemaStep[] = schemaSteps) {}

  async migrate(driver: StorageDriver): Promise<void> {
    return this.migrateTo(driver, this.steps[this.steps.length - 1]?.version ?? 1)
  }

  async migrateTo(driver: StorageDriver, targetVersion: number): Promise<void> {
    const currentVersion = await driver.getSchemaVersion()

    if (currentVersion === targetVersion) {
      return
    }

    if (targetVersion > currentVersion) {
      // Upgrade: run steps in ascending order
      const stepsToRun = this.steps.filter((step) => step.version > currentVersion && step.version <= targetVersion)

      for (const step of stepsToRun) {
        try {
          await driver.transaction([...Object.keys(COLLECTIONS)] as CollectionName[], 'readwrite', async (tx) => {
            const ctx = new InternalMigrationContext(tx)
            await step.migrate(ctx)
            await driver.setSchemaVersion(step.version, tx)
          })
        } catch (error) {
          throw new MigrationError(step.version, step.description, error as Error)
        }
      }
    } else {
      // Downgrade: run steps in descending order, calling down()
      const stepsToRun = this.steps.filter((step) => step.version <= currentVersion && step.version > targetVersion).sort((a, b) => b.version - a.version)

      for (const step of stepsToRun) {
        try {
          await driver.transaction([...Object.keys(COLLECTIONS)] as CollectionName[], 'readwrite', async (tx) => {
            const ctx = new InternalMigrationContext(tx)
            if (step.down) {
              await step.down(ctx)
            }
            await driver.setSchemaVersion(step.version - 1, tx)
          })
        } catch (error) {
          throw new MigrationError(step.version, step.description, error as Error)
        }
      }
    }
  }
}
