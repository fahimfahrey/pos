# SQLite Storage Adapter

This adapter implements the `StorageDriver` contract using [better-sqlite3](https://github.com/WiseLibs/better-sqlite3), a high-performance synchronous SQLite binding for Node.js.

## Engine-Specific Caveats

### Server-Only Execution

The SQLite adapter uses `better-sqlite3`, a native Node.js addon that cannot run in the browser. To prevent webpack's client compiler from attempting to bundle it:

- **Do not import** `src/infrastructure/storage/adapters/sqlite` from shared, client-reachable modules like `src/infrastructure/storage/index.ts`.
- **Always import** from `src/infrastructure/storage/server.ts` instead, which is marked with `import 'server-only'` and will fail the build if accidentally imported by client code.

### Write Serialization

All `'readwrite'` transactions are serialized through a single in-process queue (`writeQueue: Promise<void>`) to ensure atomicity. This is a per-process guarantee only:

- **Single-process deployments (e.g., local dev, single Node.js server)**: Writes are fully serialized; no `SQLITE_BUSY` errors occur.
- **Multi-process deployments (e.g., multiple Node.js workers sharing the same SQLite file)**: SQLite's own file-level locking handles mutual exclusion, but `SQLITE_BUSY` may occur if processes contend heavily. The single in-process queue does not provide cross-process synchronization.

For production multi-process setups, consider:
- Running multiple SQLite instances (e.g., per worker, with synchronization via a messaging layer), or
- Using a dedicated SQL database (PostgreSQL, MySQL) if cross-process transactions are critical.

### Storage Schema

Data is stored in two tables:

- **`kv_store(collection TEXT, id TEXT, data TEXT, PRIMARY KEY (collection, id))`**: All application records, serialized as JSON in the `data` column.
- **`meta(key TEXT PRIMARY KEY, value TEXT)`**: Metadata including `schemaVersion`.

The flat key-value schema means:
- No per-collection SQL migration overhead; the same schema accommodates any `CollectionName` from `src/infrastructure/storage/core/schema.ts`.
- All secondary queries (filtering, sorting) are evaluated in-process on `getAll()` results, same as the memory and IndexedDB adapters.
- No foreign key constraints are enforced (pragma `foreign_keys = OFF`), matching the storage contract's own lack of relational semantics.

### Pragmas

On `open()`, the following pragmas are set for performance and reliability:

- `PRAGMA journal_mode = WAL`: Write-ahead logging for better concurrency (multiple readers can run while writes complete).
- `PRAGMA synchronous = NORMAL`: Balanced durability/performance (safe for crashes, not for OS-level power loss).
- `PRAGMA foreign_keys = OFF`: No foreign key constraint checking (the contract has none).

### Ephemeral Mode

Pass `{ ephemeral: true }` to the constructor to use `:memory:` (in-memory SQLite) instead of a persistent file. Useful for tests and temporary data.

### Dates and Serialization

Records are serialized to JSON as-is, same as the memory and IndexedDB adapters. Dates should use the `{ $date: "ISO8601" }` codec handled by the core `SerializationCodec` in export/import flows.

## Testing

The SQLite adapter passes the complete conformance suite unmodified:

```bash
npm run test:conformance:node    # All adapters (memory, sqlite)
npm run test:conformance:browser # Browser-only adapters (memory, indexeddb)
```

See `tests/storage/sqlite-adapter.test.ts` for the driver-level conformance tests, and `src/infrastructure/storage/conformance/adapters.ts` for the matrix runner.
