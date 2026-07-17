import type { ConformanceAdapter } from './types'
import { createStorageProvider } from '@infra/storage'

// Ensure engine registry is populated
import '@infra/storage'

export const defaultConformanceAdapters: ConformanceAdapter[] = [
  {
    name: 'memory',
    engine: 'memory',
    capabilities: {
      serializableTransactions: false,
    },
    createProvider: async () => {
      return createStorageProvider({ engine: 'memory' })
    },
  },
]
