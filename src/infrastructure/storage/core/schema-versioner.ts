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
]

export class SchemaVersioner {
  async migrate(driver: StorageDriver): Promise<void> {
    const currentVersion = await driver.getSchemaVersion()

    const stepsToRun = schemaSteps.filter((step) => step.version > currentVersion)

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
  }
}
