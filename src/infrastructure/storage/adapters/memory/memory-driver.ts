import type {
  CollectionName,
  DriverTransaction,
  SchemaDescriptor,
  StorageDriver,
  TxMode,
} from '../../core/driver'

class InMemoryTransaction implements DriverTransaction {
  constructor(private data: Map<CollectionName, Map<string, unknown>>) {}

  get<T>(collection: CollectionName, id: string): Promise<T | undefined> {
    const coll = this.data.get(collection)
    if (!coll) return Promise.resolve(undefined)
    const record = coll.get(id)
    // Deep clone to prevent accidental mutation of stored state
    return Promise.resolve(record ? this.clone(record) : undefined) as Promise<T | undefined>
  }

  async getAll<T>(collection: CollectionName): Promise<T[]> {
    const coll = this.data.get(collection)
    if (!coll) return []
    return Array.from(coll.values()).map((r) => this.clone(r)) as T[]
  }

  put<T extends { id: string }>(collection: CollectionName, value: T): Promise<void> {
    if (!this.data.has(collection)) {
      this.data.set(collection, new Map())
    }
    const coll = this.data.get(collection)!
    // Store a clone to prevent external mutation
    coll.set(value.id, this.clone(value))
    return Promise.resolve()
  }

  delete(collection: CollectionName, id: string): Promise<void> {
    const coll = this.data.get(collection)
    if (coll) {
      coll.delete(id)
    }
    return Promise.resolve()
  }

  private clone(obj: unknown): unknown {
    if (typeof structuredClone !== 'undefined') {
      return structuredClone(obj)
    }
    // Fallback for environments without structuredClone
    return JSON.parse(JSON.stringify(obj, (_, val) => {
      if (val instanceof Date) return val.toISOString()
      return val
    }))
  }
}

export class MemoryStorageDriver implements StorageDriver {
  readonly engine = 'memory'
  private store = new Map<CollectionName, Map<string, unknown>>()
  private version = 0

  async open(schema: SchemaDescriptor): Promise<void> {
    // Initialize empty collections for the schema
    for (const collection of schema.collections) {
      if (!this.store.has(collection)) {
        this.store.set(collection, new Map())
      }
    }
  }

  async transaction<T>(
    collections: CollectionName[],
    mode: TxMode,
    work: (tx: DriverTransaction) => Promise<T>,
  ): Promise<T> {
    // For in-memory, we stage a snapshot of touched collections
    const staged = new Map<CollectionName, Map<string, unknown>>()

    // Clone touched collections into staging area
    for (const collection of collections) {
      const original = this.store.get(collection)
      if (original) {
        const staged_coll = new Map<string, unknown>()
        for (const [id, record] of original.entries()) {
          staged_coll.set(id, this.structuredClone(record))
        }
        staged.set(collection, staged_coll)
      } else {
        staged.set(collection, new Map())
      }
    }

    const tx = new InMemoryTransaction(staged)

    const result = await work(tx)

    // On success, swap staged back to live store
    if (mode === 'readwrite') {
      for (const collection of collections) {
        const staged_coll = staged.get(collection)
        if (staged_coll) {
          this.store.set(collection, staged_coll)
        }
      }
    }

    return result
  }

  async getSchemaVersion(): Promise<number> {
    return this.version
  }

  async setSchemaVersion(version: number, _tx?: DriverTransaction): Promise<void> {
    this.version = version
  }

  async close(): Promise<void> {
    this.store.clear()
  }

  private structuredClone(obj: unknown): unknown {
    if (typeof structuredClone !== 'undefined') {
      return structuredClone(obj)
    }
    return JSON.parse(JSON.stringify(obj))
  }
}
