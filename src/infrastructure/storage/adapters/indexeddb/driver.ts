import type Dexie from 'dexie'
import type { Transaction } from 'dexie'
import type {
  CollectionName,
  DriverTransaction,
  SchemaDescriptor,
  StorageDriver,
  TxMode,
} from '../../core/driver'
import { COLLECTIONS } from '../../core/schema'
import { META_STORE, SCHEMA_VERSION_KEY, buildVersionChain } from './schema'
import {
  mapIndexedDbError,
  StorageUnavailableError,
  StorageUpgradeBlockedError,
} from './errors'

/**
 * IndexedDB transaction wrapper implementing DriverTransaction.
 * Delegates all operations to the underlying Dexie transaction.
 */
class IndexedDBTransaction implements DriverTransaction {
  constructor(public readonly dexieTx: Transaction) {}

  get<T>(collection: CollectionName, id: string): Promise<T | undefined> {
    try {
      return this.dexieTx
        .table(collection)
        .get(id)
        .then((result) => result as T | undefined)
    } catch (err) {
      throw mapIndexedDbError(err)
    }
  }

  async getAll<T>(collection: CollectionName): Promise<T[]> {
    try {
      return (await this.dexieTx.table(collection).toArray()) as T[]
    } catch (err) {
      throw mapIndexedDbError(err)
    }
  }

  put<T extends { id: string }>(collection: CollectionName, value: T): Promise<void> {
    try {
      return this.dexieTx.table(collection).put(value).then(() => undefined)
    } catch (err) {
      throw mapIndexedDbError(err)
    }
  }

  delete(collection: CollectionName, id: string): Promise<void> {
    try {
      return this.dexieTx.table(collection).delete(id).then(() => undefined)
    } catch (err) {
      throw mapIndexedDbError(err)
    }
  }

  async getByIndex<T>(
    collection: CollectionName,
    index: string,
    key: unknown,
  ): Promise<T | undefined> {
    try {
      return (await this.dexieTx
        .table(collection)
        .where(index)
        .equals(key)
        .first()) as T | undefined
    } catch (err) {
      throw mapIndexedDbError(err)
    }
  }
}

/**
 * IndexedDB storage driver using Dexie.
 * Implements lazy-open, atomic transactions, and schema versioning via __meta__ store.
 */
export class IndexedDBDriver implements StorageDriver {
  readonly engine = 'indexeddb'

  private db: Dexie | null = null
  private blockageFlag = false

  constructor(
    private opts: {
      databaseName: string
      ephemeral?: boolean
    },
  ) {}

  /**
   * Lazy-open: initialize Dexie instance if not already open.
   * Sets up versionchange/blocked handlers and applies the version chain.
   */
  private async ensureOpen(): Promise<void> {
    if (this.db && this.db.isOpen()) {
      return
    }

    // Check if IndexedDB is available
    if (typeof indexedDB === 'undefined') {
      throw new StorageUnavailableError(
        'IndexedDB is not available in this environment',
      )
    }

    // Lazy-import Dexie only when needed (SSR safety)
    const DexieClass = (await import('dexie')).default
    const db = new DexieClass(this.opts.databaseName)

    // Listen for versionchange (another tab is upgrading)
    db.on('versionchange', () => {
      if (db.isOpen()) {
        db.close()
      }
    })

    // Listen for blocked events (another tab holds old connection during upgrade)
    let blockedTimeout: ReturnType<typeof setTimeout> | null = null
    db.on('blocked', () => {
      this.blockageFlag = true
      // Set a timeout to allow the upgrade to succeed after a brief wait
      if (blockedTimeout) clearTimeout(blockedTimeout)
      blockedTimeout = setTimeout(() => {
        this.blockageFlag = false
      }, 100)
    })

    try {
      // Wire up the version chain from the schema
      buildVersionChain(db)

      // Open the database
      await db.open()

      // If blocked during open, raise an error
      if (this.blockageFlag) {
        db.close()
        throw new StorageUpgradeBlockedError(
          'Storage upgrade blocked by another tab. Please close other instances of this app and try again.',
        )
      }

      this.db = db
    } catch (err) {
      if (this.blockageFlag) {
        throw new StorageUpgradeBlockedError(
          'Storage upgrade blocked by another tab',
          err instanceof Error ? err : undefined,
        )
      }
      throw mapIndexedDbError(err)
    }
  }

  async open(schema: SchemaDescriptor): Promise<void> {
    // The schema param is advisory; Dexie uses COLLECTIONS from the core schema
    await this.ensureOpen()
  }

  async transaction<T>(
    collections: CollectionName[],
    mode: TxMode,
    work: (tx: DriverTransaction) => Promise<T>,
  ): Promise<T> {
    await this.ensureOpen()

    // Always include __meta__ in the transaction scope for atomicity with schema version writes
    const tables = Array.from(new Set([...collections, META_STORE]))
    const dmode = mode === 'readwrite' ? 'rw' : 'r'

    try {
      return await this.db!.transaction(dmode, tables, async (dexieTx) => {
        const tx = new IndexedDBTransaction(dexieTx)
        return await work(tx)
      })
    } catch (err) {
      // Only remap DOM/Dexie infra errors; preserve caller-thrown domain errors
      if (
        err instanceof DOMException ||
        (err instanceof Error &&
          (err.name === 'QuotaExceededError' ||
            err.name === 'DataCloneError' ||
            err.name === 'AbortError' ||
            err.name === 'VersionError'))
      ) {
        throw mapIndexedDbError(err)
      }
      // Re-throw domain errors unchanged
      throw err
    }
  }

  async getSchemaVersion(): Promise<number> {
    await this.ensureOpen()

    const version = await this.db!.table<any>(META_STORE).get(
      SCHEMA_VERSION_KEY,
    )
    return version?.value ?? 0
  }

  async setSchemaVersion(
    version: number,
    tx?: DriverTransaction,
  ): Promise<void> {
    // If called within a transaction, write through that transaction
    if (tx instanceof IndexedDBTransaction) {
      await tx.dexieTx
        .table(META_STORE)
        .put({ id: SCHEMA_VERSION_KEY, value: version })
      return
    }

    // Otherwise, open a tiny transaction for the write
    await this.ensureOpen()
    await this.db!.transaction('rw', [META_STORE], async (dexieTx) => {
      await dexieTx.table(META_STORE).put({ id: SCHEMA_VERSION_KEY, value: version })
    })
  }

  async close(): Promise<void> {
    if (this.db && this.db.isOpen()) {
      this.db.close()
    }

    // If ephemeral mode, delete the database
    if (this.opts.ephemeral && this.db) {
      const DexieClass = (await import('dexie')).default
      try {
        await DexieClass.delete(this.opts.databaseName)
      } catch (err) {
        // Ignore deletion errors in close
        console.warn('Failed to delete ephemeral database:', err)
      }
    }

    this.db = null
  }
}
