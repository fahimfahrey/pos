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
