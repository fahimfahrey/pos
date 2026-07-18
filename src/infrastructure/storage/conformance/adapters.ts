import type { ConformanceAdapter } from './types'
import { createStorageProvider, registerEngine } from '@infra/storage'
import { IndexedDBDriver, ephemeralDatabaseName } from '@infra/storage/adapters/indexeddb'

// Ensure engine registry is populated
import '@infra/storage'

// Register the ephemeral IndexedDB engine for conformance testing
registerEngine('indexeddb-conformance', () =>
  new IndexedDBDriver({
    databaseName: ephemeralDatabaseName(),
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
]
