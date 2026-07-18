import type { FileStore, StoredFile } from '@shared/ports/file-store'

export class MemoryFileStore implements FileStore {
  private files = new Map<string, StoredFile>()

  async save(file: StoredFile): Promise<void> {
    this.files.set(file.id, file)
  }

  async load(id: string): Promise<StoredFile | null> {
    return this.files.get(id) ?? null
  }

  async delete(id: string): Promise<void> {
    this.files.delete(id)
  }
}
