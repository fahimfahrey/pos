export interface StoredFile {
  id: string
  data: Blob
  mimeType: string
  createdAt: Date
}

export interface FileStore {
  save(file: StoredFile): Promise<void>
  load(id: string): Promise<StoredFile | null>
  delete(id: string): Promise<void>
}
