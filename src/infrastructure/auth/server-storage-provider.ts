// Import from the top-level barrel (not core/storage-provider directly) so the
// memory/indexeddb engine registrations run as a side effect. Server Actions get
// their own isolated bundle, so nothing else guarantees those registrations happen.
import { createStorageProvider } from '@infra/storage'
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
