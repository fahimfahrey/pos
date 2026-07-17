import type { StorageProvider } from './core/storage-provider'
import { env } from '@/shared/env'
import { createStorageProvider } from './core/storage-provider'

/**
 * Determine the default storage engine based on environment and availability.
 * Returns 'indexeddb' when IndexedDB is available (browser),
 * falls back to 'memory' for SSR/Node where IndexedDB is undefined.
 */
export function defaultStorageEngine(): string {
  // Check if we're in a browser context with IndexedDB available
  if (typeof indexedDB !== 'undefined') {
    return env.NEXT_PUBLIC_STORAGE_ENGINE
  }

  // Fallback to memory for SSR/Node environments
  return 'memory'
}

/**
 * Create a storage provider using the default engine.
 * This is the recommended entry point for the app.
 */
export async function createDefaultStorageProvider(): Promise<StorageProvider> {
  return createStorageProvider({ engine: defaultStorageEngine() })
}
