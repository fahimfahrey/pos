export type CollectionName = string

export interface SchemaDescriptor {
  version: number
  collections: CollectionName[]
}

export interface DriverTransaction {
  get<T>(collection: CollectionName, id: string): Promise<T | undefined>
  getAll<T>(collection: CollectionName): Promise<T[]>
  put<T extends { id: string }>(collection: CollectionName, value: T): Promise<void>
  delete(collection: CollectionName, id: string): Promise<void>
  getByIndex?<T>(collection: CollectionName, index: string, key: unknown): Promise<T | undefined>
}

export type TxMode = 'readonly' | 'readwrite'

export interface StorageDriver {
  readonly engine: string
  open(schema: SchemaDescriptor): Promise<void>
  transaction<T>(
    collections: CollectionName[],
    mode: TxMode,
    work: (tx: DriverTransaction) => Promise<T>
  ): Promise<T>
  getSchemaVersion(): Promise<number>
  setSchemaVersion(version: number, tx?: DriverTransaction): Promise<void>
  close(): Promise<void>
}

export type DriverFactory = () => StorageDriver
