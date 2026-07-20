# Storage Adapter Authoring Guide

This guide explains how to implement a new storage engine adapter for the POS storage subsystem. The goal is: **one adapter = one file + one config change**.

## Overview

The storage subsystem provides a minimal `StorageDriver` contract that every engine must implement. Once a driver is registered, it automatically gains:

- All 10 repository interfaces with full CRUD semantics
- Transaction support with atomic commit/rollback
- Schema versioning and migration
- Export/import for backups and cross-engine migration
- Date-safe serialization

## What Is a StorageDriver?

A `StorageDriver` is the **only** per-engine contract. It provides:

```typescript
// src/infrastructure/storage/core/driver.ts
interface StorageDriver {
  readonly engine: string
  open(schema: SchemaDescriptor): Promise<void>
  transaction<T>(
    collections: CollectionName[],
    mode: TxMode,
    work: (tx: DriverTransaction) => Promise<T>
  ): Promise<T>
  getSchemaVersion(): Promise<number>
  setSchemaVersion(version: number, tx?: DriverTransaction): Promise<void>
  close(): Promise<void>
}

// Provided within each transaction
interface DriverTransaction {
  get<T>(collection: CollectionName, id: string): Promise<T | undefined>
  getAll<T>(collection: CollectionName): Promise<T[]>
  put<T extends { id: string }>(collection: CollectionName, value: T): Promise<void>
  delete(collection: CollectionName, id: string): Promise<void>
}
```

That's it. No secondary indexes, no query builders, no special types. The core subsystem builds everything else on top of this minimal primitive.

## Implementation Steps

### 1. Scaffold the Adapter

Create a new adapter in `src/infrastructure/storage/adapters/<engine-name>/`:

```
src/infrastructure/storage/adapters/
└── <engine-name>/
    ├── index.ts          # Registration
    └── driver.ts         # DriverFactory
```

### 2. Implement StorageDriver

Example: IndexedDB adapter (pseudocode)

```typescript
// src/infrastructure/storage/adapters/indexeddb/driver.ts
import type { StorageDriver, DriverTransaction, SchemaDescriptor, CollectionName, TxMode } from '../../core'

class IndexedDBTransaction implements DriverTransaction {
  constructor(private tx: IDBTransaction) {}

  async get<T>(collection: CollectionName, id: string): Promise<T | undefined> {
    const objectStore = this.tx.objectStore(collection)
    return new Promise((resolve, reject) => {
      const req = objectStore.get(id)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  async getAll<T>(collection: CollectionName): Promise<T[]> {
    const objectStore = this.tx.objectStore(collection)
    return new Promise((resolve, reject) => {
      const req = objectStore.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  async put<T extends { id: string }>(collection: CollectionName, value: T): Promise<void> {
    const objectStore = this.tx.objectStore(collection)
    return new Promise((resolve, reject) => {
      const req = objectStore.put(value)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async delete(collection: CollectionName, id: string): Promise<void> {
    const objectStore = this.tx.objectStore(collection)
    return new Promise((resolve, reject) => {
      const req = objectStore.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }
}

export class IndexedDBDriver implements StorageDriver {
  readonly engine = 'indexeddb'
  private db: IDBDatabase | null = null

  async open(schema: SchemaDescriptor): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('pos-db', schema.version)

      req.onupgradeneeded = () => {
        const db = req.result
        for (const collection of schema.collections) {
          if (!db.objectStoreNames.contains(collection)) {
            db.createObjectStore(collection, { keyPath: 'id' })
          }
        }
      }

      req.onsuccess = () => {
        this.db = req.result
        resolve()
      }

      req.onerror = () => reject(req.error)
    })
  }

  async transaction<T>(
    collections: CollectionName[],
    mode: TxMode,
    work: (tx: DriverTransaction) => Promise<T>
  ): Promise<T> {
    if (!this.db) throw new Error('Database not opened')
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(collections, mode === 'readwrite' ? 'readwrite' : 'readonly')
      const wrapper = new IndexedDBTransaction(tx)

      work(wrapper).then(resolve).catch(reject)

      tx.onerror = () => reject(tx.error)
    })
  }

  async getSchemaVersion(): Promise<number> {
    return this.db?.version ?? 1
  }

  async setSchemaVersion(version: number, tx?: DriverTransaction): Promise<void> {
    // Store logical schema version in an internal __meta__ store
    // Decoupled from the database structural version (managed by open())
    const metaStore = this.tx.objectStore('__meta__')
    await this.putInStore(metaStore, { id: 'schemaVersion', value: version })
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}
```

### 3. Register the Adapter

```typescript
// src/infrastructure/storage/adapters/indexeddb/index.ts
import { IndexedDBDriver } from './driver'
import { registerEngine } from '../../core/engine-registry'

registerEngine('indexeddb', () => new IndexedDBDriver())

export { IndexedDBDriver }
```

### 4. Wire It Up (One Config Change)

Edit `src/infrastructure/storage/index.ts` to import the adapter:

```typescript
// src/infrastructure/storage/index.ts
import '@/src/infrastructure/storage/adapters/memory'
import '@/src/infrastructure/storage/adapters/indexeddb'  // ← Add this line

export * from './core'
```

That's all. The adapter is now available.

### 5. Configure the App to Use It

Set the environment variable:

```bash
# In your .env.local or build script
NEXT_PUBLIC_STORAGE_ENGINE=indexeddb
```

(If `indexeddb` is not registered, startup throws `UnknownEngineError` with available engines listed.)

## Adapter Conformance

New adapters must pass the conformance test suite:

```typescript
// tests/storage/<engine>-adapter.test.ts
import { runStorageConformance } from './conformance'
import { YourDriver } from '@infra/storage/adapters/<engine>/driver'

runStorageConformance('<engine>', () => new YourDriver())
```

Run:

```bash
npm run test tests/storage/<engine>-adapter.test.ts
```

The conformance suite validates:
- CRUD operations across all 10 contexts
- Transaction commit/rollback atomicity
- Schema versioning
- Export/import round-trip with Date fidelity
- Isolation (mutations don't leak into stored state)

All checks must pass.

## Effort Estimate

- **In-memory (reference) adapter** (Vitest fake-indexeddb): ~2 hours
  - Straightforward key/value store; clone on read/write for isolation.
  
- **IndexedDB (browser)** adapter: ~4–6 hours
  - Async Promise-based API; tricky upgrade handler; transaction event model differs from `async/await`.

- **SQLite (Wasm or native)** adapter: ~6–8 hours
  - SQL → collection API translation; prepared statements; transaction scoping.

- **LevelDB or RocksDB** adapter: ~4–6 hours
  - Sync or Promise API depending on binding; batch writes.

- **PostgreSQL or MySQL** adapter: ~8–12 hours
  - Schema migration mapping; connection pooling; transaction isolation levels; networking and error recovery.

**Runtime assumptions:**
- Records fit in memory (POS datasets are small — hundreds to thousands of items).
- `getAll()` scans the entire collection (no required secondary indexes; index optimization is future and optional).
- Queries are simple predicates (`filter`, `find`) evaluated in-process; the driver need not optimize them.

## Key Design Principles

1. **Minimal contract.** Drivers implement only `DriverTransaction` primitives (`get`, `getAll`, `put`, `delete`) and transaction semantics. No queries, indexes, or special types.

2. **Core handles the rest.** The subsystem builds typed repositories, migrations, export/import, and schema versioning entirely from the primitives. This means:
   - A bug fix in core benefits all engines.
   - Engines are lean and correct by construction.

3. **Date safety.** Export/import uses a tagged codec (`{ $date: "<ISO>" }`) for Date serialization so data survives round-trip without loss. Engines store JSON as-is; core handles codec.

4. **No SSR risk.** Drivers are constructed lazily inside `createStorageProvider`, never at module import. The in-memory driver is safe everywhere; browser drivers (`indexeddb`) are only instantiated in client code.

5. **Atomicity is mandatory.** `transaction()` must commit all writes or none. This is non-negotiable for correctness.

6. **Transactions must not perform I/O unrelated to the transaction.** The `work` callback in `transaction<T>(collections, mode, work)` may only use methods on the provided `tx` parameter (`get`, `getAll`, `put`, `delete`). Performing external I/O (HTTP requests, file operations, or accessing other databases) within the callback breaks atomicity and consistency guarantees. If the transaction is rolled back, the external operation will have occurred anyway, creating inconsistency. Always perform external work outside the transaction.

## Server-Only / Native-Dependency Adapters

Adapters that depend on native modules (e.g., `better-sqlite3`, future Node.js database drivers) or that are only usable in server environments must be carefully isolated to prevent webpack's client compiler from attempting to bundle them.

**The pattern:**

1. **Create the adapter normally** in `src/infrastructure/storage/adapters/<engine>/` with registration in `index.ts`.

2. **Never import the adapter in the shared** `src/infrastructure/storage/index.ts`. That file is reachable from client code and will cause the client webpack compiler to fail when it encounters the native module.

3. **Create a server-only barrel** at `src/infrastructure/storage/server.ts`:
   ```typescript
   import 'server-only'  // ← Fails build if accidentally imported by client code
   
   // Import adapters that have native dependencies or are server-only
   import './adapters/sqlite'   // Registration side-effect only
   
   // Re-export public API
   export * from './core'
   export * from './default-provider'
   ```

4. **Import the adapter only from server contexts:**
   - Server actions
   - API routes
   - Migration scripts (running under Node.js)
   - Tests that run under Node.js (Vitest, not browser mode)

5. **Document the adapter's caveats** in its `README.md` about single-process limitations, if any.

**Example: SQLite via better-sqlite3**

SQLite using `better-sqlite3` is a Node.js native addon and cannot run in browsers. It also offers fully synchronous APIs that simplify transaction handling. For these reasons, it is registered only in the server-only module:

- Application code uses it via server actions or future multi-process deployments.
- The conformance test suite includes it (tests run under Node.js).
- The migration script (`scripts/migrate-engine.ts`) imports from `storage/server.ts` to access it.
- Browser-based data storage remains `indexeddb`; SQLite is a server-side tool.

## Checklist

- [ ] Created `src/infrastructure/storage/adapters/<engine>/driver.ts` implementing `StorageDriver`.
- [ ] Implemented all `DriverTransaction` methods (`get`, `getAll`, `put`, `delete`).
- [ ] Implemented `open`, `transaction`, `getSchemaVersion`, `setSchemaVersion`, `close`.
- [ ] Created `src/infrastructure/storage/adapters/<engine>/index.ts` calling `registerEngine`.
- [ ] Created `tests/storage/<engine>-adapter.test.ts` and it passes `runStorageConformance`.
- [ ] Added import in `src/infrastructure/storage/index.ts`.
- [ ] Verified `npm run typecheck`, `npm run lint`, `npm run test` all pass.
- [ ] Confirmed `NEXT_PUBLIC_STORAGE_ENGINE=<engine>` resolves without error.
- [ ] (Optional) Documented any engine-specific caveats in a `README.md` inside the adapter folder.

## Environment Variable Reference

**`NEXT_PUBLIC_STORAGE_ENGINE`** (default: `'indexeddb'`, client-only)

Specifies the storage engine to use in the browser. Must be a registered engine name that is safe for client code (currently `'memory'` or `'indexeddb'`). Do **not** use server-only engines like `'sqlite'` here.

**`STORAGE_ENGINE`** (default: `'memory'`, server-only)

Specifies the storage engine to use in Node.js server contexts (API routes, server actions, migration scripts). Can be any registered engine (including server-only ones like `'sqlite'`).

**Why two vars?** The client and server may use different engines:
- Browser always uses `indexeddb` or `memory` (via `NEXT_PUBLIC_STORAGE_ENGINE`).
- Server may use `memory` (for ephemeral operations), `indexeddb` (via mocked fake-indexeddb for tests), or `sqlite` (for persistence, migrations, backups).

**Programmatic override:**

```typescript
const provider = await createStorageProvider({ engine: 'memory' })
```

overrides the env var and uses the specified engine directly.

## Troubleshooting

**"Storage engine '<name>' not found"**
- The engine was not registered. Ensure its `index.ts` calls `registerEngine` and is imported by `src/infrastructure/storage/index.ts`.

**"UnitOfWork already committed/rolled back"**
- A `UnitOfWork` can only commit or rollback once. Ensure you're not calling either method twice.

**"Invalid export format"**
- The export being imported has `format !== 'pos.storage.export'`. Ensure it came from `exportAll()`.

**Dates become strings after import**
- Use the `SerializationCodec` in export/import; it tags dates as `{ $date: "..." }` and revives them on import. Check that `exportAll`/`importAll` are from core.

---

**Questions?** See `src/infrastructure/storage/core/` for the canonical interfaces, `src/infrastructure/storage/adapters/memory/` for a complete reference implementation, and `src/infrastructure/storage/adapters/indexeddb/README.md` for browser-specific caveats. For backup/restore procedures, see `docs/backup.md`.
