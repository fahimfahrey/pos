import { createStorageProvider } from '@infra/storage/core/storage-provider'
import type { StorageProvider } from '@infra/storage/core/storage-provider'

let serverProvider: StorageProvider | null = null
let providerPromise: Promise<StorageProvider> | null = null

/**
 * Get or create a server-side storage provider singleton.
 * This ensures that in-memory data persists across requests in Node.js.
 * For multi-instance servers, a shared storage engine (like IndexedDB bridge or Redis)
 * is required.
 */
export async function getServerStorageProvider(): Promise<StorageProvider> {
  if (serverProvider) {
    return serverProvider
  }

  if (!providerPromise) {
    providerPromise = createStorageProvider({ engine: 'memory' })
      .then(provider => {
        serverProvider = provider
        return provider
      })
  }

  return providerPromise
}
