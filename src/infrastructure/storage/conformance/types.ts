import type { StorageProvider } from '@infra/storage'

export interface AdapterCapabilities {
  /** Whether the adapter guarantees strict SERIALIZABLE isolation for concurrent transactions. */
  serializableTransactions: boolean
}

export interface ConformanceAdapter {
  /** Display name for this adapter (e.g., "memory", "postgres"). */
  name: string

  /** Factory to create a fresh StorageProvider instance. */
  createProvider(): Promise<StorageProvider>

  /** Engine name for raw driver resolution (e.g., "memory"). */
  engine: string

  /** Advertised capabilities of this adapter. */
  capabilities: AdapterCapabilities
}
