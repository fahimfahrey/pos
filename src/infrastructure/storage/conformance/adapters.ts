import type { ConformanceAdapter } from './types'
import { createStorageProvider, registerEngine } from '@infra/storage'
import { IndexedDBDriver, ephemeralDatabaseName } from '@infra/storage/adapters/indexeddb'
import { SqliteDriver } from '@infra/storage/adapters/sqlite'

// Ensure engine registry is populated
import '@infra/storage'

// Register the ephemeral IndexedDB engine for conformance testing
registerEngine('indexeddb-conformance', () =>
  new IndexedDBDriver({
    databaseName: ephemeralDatabaseName(),
    ephemeral: true,
  }),
)

// Register the ephemeral SQLite engine for conformance testing
registerEngine('sqlite-conformance', () =>
  new SqliteDriver({
    ephemeral: true,
  }),
)

export const defaultConformanceAdapters: ConformanceAdapter[] = [
  {
    name: 'memory',
    engine: 'memory',
    capabilities: {
      serializableTransactions: true,
    },
    createProvider: async () => {
      return createStorageProvider({ engine: 'memory' })
    },
  },
  {
    name: 'indexeddb',
    engine: 'indexeddb-conformance',
    capabilities: {
      serializableTransactions: true,
    },
    createProvider: async () => {
      return createStorageProvider({ engine: 'indexeddb-conformance' })
    },
  },
  {
    name: 'sqlite',
    engine: 'sqlite-conformance',
    capabilities: {
      serializableTransactions: true,
    },
    createProvider: async () => {
      return createStorageProvider({ engine: 'sqlite-conformance' })
    },
  },
]
