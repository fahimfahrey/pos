import type { FileStore, StoredFile } from '@shared/ports/file-store'

const DB_NAME = 'pos-files'
const STORE_NAME = 'files'

export class IndexedDBFileStore implements FileStore {
  private db: IDBDatabase | null = null

  private async ensureOpen(): Promise<IDBDatabase> {
    if (this.db) return this.db

    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is not available')
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  async save(file: StoredFile): Promise<void> {
    const db = await this.ensureOpen()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put(file)

      request.onerror = () => reject(request.error)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async load(id: string): Promise<StoredFile | null> {
    const db = await this.ensureOpen()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result ?? null)
    })
  }

  async delete(id: string): Promise<void> {
    const db = await this.ensureOpen()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}
