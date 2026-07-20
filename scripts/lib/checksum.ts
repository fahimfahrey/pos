import { createHash } from 'crypto'

/**
 * Computes a checksum for a collection of records.
 * Returns both row count and SHA-256 digest of normalized (key-sorted) JSON.
 */
export async function computeChecksum(records: unknown[]): Promise<{
  rowCount: number
  digest: string
}> {
  const rowCount = records.length

  // Sort records by their string representation for consistent ordering
  const sorted = [...records].sort((a, b) => {
    const aStr = JSON.stringify(a)
    const bStr = JSON.stringify(b)
    return aStr.localeCompare(bStr)
  })

  // Compute SHA-256 digest of the concatenated JSON
  const hash = createHash('sha256')
  for (const record of sorted) {
    const normalized = normalizeRecord(record)
    hash.update(JSON.stringify(normalized))
  }

  return {
    rowCount,
    digest: hash.digest('hex'),
  }
}

/**
 * Normalizes a record for consistent hashing.
 * Sorts object keys, handles dates, and removes undefined values.
 */
function normalizeRecord(record: unknown): unknown {
  if (record === null || record === undefined) {
    return record
  }

  if (record instanceof Date) {
    return { $date: record.toISOString() }
  }

  if (Array.isArray(record)) {
    return record.map(normalizeRecord)
  }

  if (typeof record === 'object') {
    const obj = record as Record<string, unknown>
    const normalized: Record<string, unknown> = {}

    // Sort keys alphabetically for consistent ordering
    const keys = Object.keys(obj).sort()
    for (const key of keys) {
      const value = obj[key]
      if (value !== undefined) {
        normalized[key] = normalizeRecord(value)
      }
    }

    return normalized
  }

  return record
}

/**
 * Verifies that two checksum pairs match.
 * Returns a detailed result object indicating success or failure.
 */
export function verifyChecksum(
  source: { rowCount: number; digest: string },
  target: { rowCount: number; digest: string },
  collectionName: string,
): { success: boolean; message: string } {
  if (source.rowCount !== target.rowCount) {
    return {
      success: false,
      message: `Mismatch in ${collectionName}: row count source=${source.rowCount} vs target=${target.rowCount}`,
    }
  }

  if (source.digest !== target.digest) {
    return {
      success: false,
      message: `Mismatch in ${collectionName}: digest source=${source.digest} vs target=${target.digest}`,
    }
  }

  return {
    success: true,
    message: `✓ ${collectionName}: ${source.rowCount} rows, digest ${source.digest.substring(0, 8)}...`,
  }
}
