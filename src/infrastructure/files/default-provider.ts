import type { FileStore } from '@shared/ports/file-store'
import { MemoryFileStore } from './adapters/memory/memory-file-store'
import { IndexedDBFileStore } from './adapters/indexeddb/indexeddb-file-store'

export function createDefaultFileStore(): FileStore {
  if (typeof indexedDB !== 'undefined') {
    return new IndexedDBFileStore()
  }
  return new MemoryFileStore()
}
