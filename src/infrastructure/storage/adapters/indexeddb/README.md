# IndexedDB Storage Adapter

Implements the storage driver interface using IndexedDB via Dexie.

## Architecture

- **One object store per entity** — mapped directly from `COLLECTIONS` in the core schema
- **Indexes for access patterns** — sku, barcode, orgId, shiftId, orderId, createdAt, etc.
- **Internal `__meta__` store** — holds the logical schema version, decoupled from Dexie's structural version
- **Atomic transactions** — Dexie's transaction zone keeps IDB transactions alive across `await` boundaries
- **Lazy-open** — database is not initialized until first use, preserving SSR safety

## Ephemeral vs. Production

The driver supports two modes:

- **Production** (`ephemeral: false`) — uses stable database name `pos-storage` for persistence across reloads
- **Conformance/Test** (`ephemeral: true`) — uses a unique database name per instance and auto-deletes on `close()`

## Error Handling

The adapter maps IndexedDB-specific errors to typed storage errors:

- `QuotaExceededError` → `StorageQuotaError` — storage quota has been exceeded
- `DataCloneError` → `StorageCloneError` — a value cannot be structured-cloned
- `AbortError` or blocked upgrades → `StorageUpgradeBlockedError` — another tab is upgrading the schema
- Missing `indexedDB` → `StorageUnavailableError` — IndexedDB is not available (SSR, private mode, etc.)

All extend the core `StorageError` so domains can catch generically.

## Multi-Tab Behavior

When another tab is upgrading the database to a higher schema version:

1. This tab receives a `versionchange` event and automatically closes its connection
2. The upgrade proceeds in the other tab
3. On next operation, this tab re-opens the connection to the new schema

If multiple tabs try to upgrade simultaneously, the `blocked` event is raised and a `StorageUpgradeBlockedError` is thrown after a timeout. Close other instances of the app to proceed.

## Structured Clone Limits

IndexedDB uses structured clone to serialize values. Most POS entities (primitives + `Date`) clone cleanly. If a non-cloneable value (function, DOM node, class instance) is stored, a `StorageCloneError` is thrown.

## Schema Versioning

The adapter maintains two independent version axes:

- **Structural** — Dexie's `version().stores()` defines object stores and indexes. Currently pinned to version 1 (schema changes rare)
- **Logical** — stored in `__meta__:{id:'schemaVersion'}`, drives data migrations via the core `SchemaVersioner`. Migrates in the range `[0, CURRENT_SCHEMA_VERSION]`

When a future schema step requires structural changes (new store/index), update `buildVersionChain()` in `schema.ts` and bump `CURRENT_SCHEMA_VERSION` in `core/schema.ts`.

## Browser Support

- Chromium/Edge: Full support (File System Access API for backups)
- Firefox/Safari: Full IndexedDB support; backups fall back to `<a download>` / `<input type=file>`
- Private browsing: IndexedDB may be unavailable; caught as `StorageUnavailableError`
- SSR/Node: Driver is lazy and never initialized; safe to import

## Backups

See `docs/backup.md` for the manual export/import round-trip.
