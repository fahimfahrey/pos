import type { CollectionName, StorageDriver } from './driver'
import { COLLECTIONS, CURRENT_SCHEMA_VERSION } from './schema'
import { ImportFormatError } from './errors'

export interface EntityEnvelope<T = unknown> {
  entity: CollectionName
  version: number
  records: T[]
}

export interface StorageExport {
  format: 'pos.storage.export'
  formatVersion: 1
  engine: string
  schemaVersion: number
  exportedAt: string
  entities: EntityEnvelope[]
}

export type ImportMode = 'replace' | 'merge'

export class SerializationCodec {
  static encode(value: unknown): unknown {
    if (value instanceof Date) {
      return { $date: value.toISOString() }
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.encode(item))
    }
    if (value !== null && typeof value === 'object') {
      const encoded: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        encoded[key] = this.encode(val)
      }
      return encoded
    }
    return value
  }

  static decode(value: unknown): unknown {
    if (
      value !== null &&
      typeof value === 'object' &&
      '$date' in value &&
      typeof (value as Record<string, unknown>).$date === 'string'
    ) {
      return new Date((value as Record<string, unknown>).$date as string)
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.decode(item))
    }
    if (value !== null && typeof value === 'object') {
      const decoded: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        decoded[key] = this.decode(val)
      }
      return decoded
    }
    return value
  }
}

export async function exportAll(driver: StorageDriver): Promise<StorageExport> {
  const entities: EntityEnvelope[] = []

  // Group collections by their context
  const collectionsByContext = new Map<string, CollectionName[]>()
  for (const [name, context] of Object.entries(COLLECTIONS)) {
    if (!collectionsByContext.has(context)) {
      collectionsByContext.set(context, [])
    }
    collectionsByContext.get(context)!.push(name as CollectionName)
  }

  // Flatten all collection names
  const allCollections = Array.from(new Set(Object.keys(COLLECTIONS)))

  await driver.transaction(allCollections as CollectionName[], 'readonly', async (tx) => {
    for (const collectionName of allCollections) {
      const records = await tx.getAll(collectionName as CollectionName)
      const encoded = records.map((r) => SerializationCodec.encode(r))
      entities.push({
        entity: collectionName as CollectionName,
        version: 1,
        records: encoded,
      })
    }
  })

  return {
    format: 'pos.storage.export',
    formatVersion: 1,
    engine: driver.engine,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    entities,
  }
}

export async function importAll(
  driver: StorageDriver,
  data: StorageExport,
  opts?: { mode?: ImportMode },
): Promise<void> {
  const mode = opts?.mode ?? 'replace'

  // Validate format
  if (data.format !== 'pos.storage.export') {
    throw new ImportFormatError(
      `Invalid export format: expected 'pos.storage.export', got '${data.format}'`,
    )
  }

  if (data.formatVersion !== 1) {
    throw new ImportFormatError(
      `Unsupported format version: expected 1, got ${data.formatVersion}`,
    )
  }

  if (!Array.isArray(data.entities)) {
    throw new ImportFormatError('Export must contain an entities array')
  }

  // Get all collection names
  const allCollections = Array.from(new Set(data.entities.map((e) => e.entity)))

  await driver.transaction(allCollections as CollectionName[], 'readwrite', async (tx) => {
    for (const envelope of data.entities) {
      if (mode === 'replace') {
        // Clear the collection first
        const existing = await tx.getAll(envelope.entity)
        for (const record of existing) {
          const rec = record as any
          if ('id' in rec && typeof rec.id === 'string') {
            await tx.delete(envelope.entity, rec.id)
          }
        }
      }

      // Import records
      for (const rec of envelope.records) {
        const decoded: unknown = SerializationCodec.decode(rec)
        if (
          decoded !== null &&
          typeof decoded === 'object' &&
          'id' in decoded &&
          typeof (decoded as Record<string, unknown>).id === 'string'
        ) {
          await tx.put(envelope.entity, decoded as { id: string })
        }
      }
    }
  })
}
