import type { RepositorySet } from './repository-set'
import type { UnitOfWork } from './unit-of-work'
import type { StorageExport, ImportMode } from './export-import'
import type { StorageDriver } from './driver'
import { withTransaction } from './unit-of-work'
import { SchemaVersioner } from './schema-versioner'
import { resolveEngine, getRegisteredEngines } from './engine-registry'
import { UnknownEngineError } from './errors'
import { exportAll, importAll } from './export-import'
import { COLLECTIONS, CURRENT_SCHEMA_VERSION } from './schema'

export interface StorageConfig {
  engine: string
}

export interface StorageProvider {
  readonly engine: string
  withTransaction<T>(fn: (repositories: RepositorySet) => Promise<T>): Promise<T>
  unitOfWork(): Promise<UnitOfWork>
  migrate(): Promise<void>
  exportAll(): Promise<StorageExport>
  importAll(data: StorageExport, opts?: { mode?: ImportMode }): Promise<void>
  close(): Promise<void>
}

class InternalStorageProvider implements StorageProvider {
  readonly engine: string

  constructor(private driver: StorageDriver) {
    this.engine = driver.engine
  }

  async withTransaction<T>(fn: (repositories: RepositorySet) => Promise<T>): Promise<T> {
    const allCollections = Array.from(Object.keys(COLLECTIONS))
    return withTransaction(this.driver, allCollections, fn)
  }

  async unitOfWork(): Promise<UnitOfWork> {
    // For now, return a simple implementation that defers to withTransaction
    // A full UnitOfWork would need explicit begin/commit/rollback
    throw new Error('UnitOfWork interface not yet fully implemented')
  }

  async migrate(): Promise<void> {
    const versioner = new SchemaVersioner()
    await versioner.migrate(this.driver)
  }

  async exportAll(): Promise<StorageExport> {
    return exportAll(this.driver)
  }

  async importAll(data: StorageExport, opts?: { mode?: ImportMode }): Promise<void> {
    return importAll(this.driver, data, opts)
  }

  async close(): Promise<void> {
    return this.driver.close()
  }
}

export async function createStorageProvider(config: StorageConfig): Promise<StorageProvider> {
  try {
    const factory = resolveEngine(config.engine)
    const driver = factory()

    // Open the driver with the schema
    const allCollections = Array.from(Object.keys(COLLECTIONS))
    await driver.open({
      version: CURRENT_SCHEMA_VERSION,
      collections: allCollections,
    })

    // Run any pending migrations
    const provider = new InternalStorageProvider(driver)
    await provider.migrate()

    return provider
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw new UnknownEngineError(config.engine, getRegisteredEngines())
    }
    throw error
  }
}
