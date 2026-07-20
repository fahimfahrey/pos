import type Database from 'better-sqlite3'
import type {
  CollectionName,
  DriverTransaction,
  SchemaDescriptor,
  StorageDriver,
  TxMode,
} from '../../core/driver'
import { mapSqliteError } from './errors'
import { resolveDatabasePath } from './database-path'

/**
 * SQLite transaction wrapper implementing DriverTransaction.
 * All operations are synchronous SQL statements, wrapped in Promise.resolve()
 * to satisfy the async interface.
 */
class SqliteTransaction implements DriverTransaction {
  constructor(
    private db: Database.Database,
    private inTransaction: boolean,
  ) {}

  get<T>(collection: CollectionName, id: string): Promise<T | undefined> {
    try {
      const stmt = this.db.prepare(
        'SELECT data FROM kv_store WHERE collection = ? AND id = ?',
      )
      const row = stmt.get(collection, id) as { data: string } | undefined

      if (!row) {
        return Promise.resolve(undefined)
      }

      const parsed = JSON.parse(row.data)
      return Promise.resolve(parsed as T)
    } catch (err) {
      return Promise.reject(mapSqliteError(err))
    }
  }

  async getAll<T>(collection: CollectionName): Promise<T[]> {
    try {
      const stmt = this.db.prepare(
        'SELECT data FROM kv_store WHERE collection = ? ORDER BY id',
      )
      const rows = stmt.all(collection) as { data: string }[]

      return rows.map((row) => JSON.parse(row.data) as T)
    } catch (err) {
      throw mapSqliteError(err)
    }
  }

  put<T extends { id: string }>(collection: CollectionName, value: T): Promise<void> {
    try {
      const stmt = this.db.prepare(
        'INSERT OR REPLACE INTO kv_store (collection, id, data) VALUES (?, ?, ?)',
      )
      const data = JSON.stringify(value)
      stmt.run(collection, value.id, data)
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(mapSqliteError(err))
    }
  }

  delete(collection: CollectionName, id: string): Promise<void> {
    try {
      const stmt = this.db.prepare(
        'DELETE FROM kv_store WHERE collection = ? AND id = ?',
      )
      stmt.run(collection, id)
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(mapSqliteError(err))
    }
  }
}

/**
 * SQLite storage driver using better-sqlite3.
 * Implements lazy-open, atomic transactions via write-queue serialization,
 * and schema versioning via a meta table.
 */
export class SqliteDriver implements StorageDriver {
  readonly engine = 'sqlite'

  private db: Database.Database | null = null
  private writeQueue: Promise<void> = Promise.resolve()
  private inTransaction = false

  constructor(
    private opts: {
      filename?: string
      ephemeral?: boolean
    },
  ) {}

  /**
   * Lazy-open: initialize the database if not already open.
   * Creates kv_store and meta tables, sets pragmas.
   */
  private ensureOpen(): void {
    if (this.db) {
      return
    }

    try {
      // Lazy-import better-sqlite3 only when needed (SSR safety)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const DatabaseClass = require('better-sqlite3')
      const dbPath = resolveDatabasePath(this.opts)
      this.db = new DatabaseClass(dbPath)

      // Set pragmas for performance and reliability
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('foreign_keys = OFF')
      this.db.pragma('synchronous = NORMAL')

      // Create the key-value store table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS kv_store (
          collection TEXT NOT NULL,
          id TEXT NOT NULL,
          data TEXT NOT NULL,
          PRIMARY KEY (collection, id)
        )
      `)

      // Create the meta table for schema version
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `)
    } catch (err) {
      throw mapSqliteError(err)
    }
  }

  async open(schema: SchemaDescriptor): Promise<void> {
    try {
      this.ensureOpen()
    } catch (err) {
      throw mapSqliteError(err)
    }
  }

  async transaction<T>(
    collections: CollectionName[],
    mode: TxMode,
    work: (tx: DriverTransaction) => Promise<T>,
  ): Promise<T> {
    try {
      this.ensureOpen()

      if (mode !== 'readwrite') {
        // Read-only transactions don't need serialization
        return await this.runTransaction(collections, mode, work)
      }

      // Write transactions are serialized via the write-queue
      const previous = this.writeQueue
      let release!: () => void
      this.writeQueue = new Promise((r) => {
        release = r
      })

      try {
        await previous
        return await this.runTransaction(collections, mode, work)
      } finally {
        release()
      }
    } catch (err) {
      throw mapSqliteError(err)
    }
  }

  private async runTransaction<T>(
    collections: CollectionName[],
    mode: TxMode,
    work: (tx: DriverTransaction) => Promise<T>,
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not opened')
    }

    const isReadWrite = mode === 'readwrite'
    const txType = isReadWrite ? 'IMMEDIATE' : 'DEFERRED'

    try {
      // Begin transaction
      this.db.exec(`BEGIN ${txType}`)
      this.inTransaction = true

      const tx = new SqliteTransaction(this.db, true)

      try {
        const result = await work(tx)

        // Commit transaction
        this.db.exec('COMMIT')
        this.inTransaction = false

        return result
      } catch (err) {
        // Rollback on error
        if (this.inTransaction) {
          try {
            this.db.exec('ROLLBACK')
          } catch (rollbackErr) {
            console.error('Failed to rollback transaction:', rollbackErr)
          }
          this.inTransaction = false
        }
        throw err
      }
    } catch (err) {
      throw mapSqliteError(err)
    }
  }

  async getSchemaVersion(): Promise<number> {
    try {
      this.ensureOpen()
      if (!this.db) {
        return 0
      }

      const stmt = this.db.prepare('SELECT value FROM meta WHERE key = ?')
      const row = stmt.get('schemaVersion') as { value: string } | undefined

      if (!row) {
        return 0
      }

      return parseInt(row.value, 10)
    } catch (err) {
      throw mapSqliteError(err)
    }
  }

  async setSchemaVersion(version: number, tx?: DriverTransaction): Promise<void> {
    try {
      this.ensureOpen()
      if (!this.db) {
        throw new Error('Database not opened')
      }

      // If called within a transaction, write through that transaction
      if (tx instanceof SqliteTransaction) {
        const stmt = this.db.prepare(
          'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
        )
        stmt.run('schemaVersion', String(version))
        return
      }

      // Otherwise, open a tiny transaction for the write
      const stmt = this.db.prepare(
        'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      )
      stmt.run('schemaVersion', String(version))
    } catch (err) {
      throw mapSqliteError(err)
    }
  }

  async close(): Promise<void> {
    try {
      if (this.db) {
        // Close any open transaction
        if (this.inTransaction) {
          try {
            this.db.exec('ROLLBACK')
          } catch (err) {
            console.warn('Failed to rollback transaction during close:', err)
          }
        }

        this.db.close()
        this.db = null
      }
    } catch (err) {
      throw mapSqliteError(err)
    }
  }
}
