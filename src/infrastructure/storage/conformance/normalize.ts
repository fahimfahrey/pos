import type { StorageExport } from '@infra/storage'

/**
 * Normalize an exported storage snapshot for order-independent deep comparison.
 * Strips volatile fields and sorts consistently for reproducible assertions.
 */
export function normalizeExport(exported: StorageExport): unknown {
  // Copy entities, sorted by entity name
  const sortedEntities = [...exported.entities].sort((a, b) => a.entity.localeCompare(b.entity))

  const normalized: Record<string, unknown> = {
    entities: sortedEntities.map((entity) => ({
      entity: entity.entity,
      version: entity.version,
      // Sort records by id for order-independent comparison
      records: [...entity.records].sort((a, b) => {
        const aId = a !== null && typeof a === 'object' && 'id' in a ? String((a as Record<string, unknown>).id) : ''
        const bId = b !== null && typeof b === 'object' && 'id' in b ? String((b as Record<string, unknown>).id) : ''
        return aId.localeCompare(bId)
      }),
    })),
  }

  return normalized
}
