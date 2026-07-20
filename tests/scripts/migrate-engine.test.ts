import { describe, it, expect } from 'vitest'
import { createStorageProvider } from '@infra/storage/server'
import { computeChecksum, verifyChecksum } from '../../scripts/lib/checksum'

describe('Migration Engine - Checksum Functions', () => {
  describe('computeChecksum', () => {
    it('should compute checksum for empty array', async () => {
      const checksum = await computeChecksum([])
      expect(checksum.rowCount).toBe(0)
      expect(checksum.digest).toBeTruthy()
      expect(checksum.digest).toHaveLength(64) // SHA-256 hex is 64 chars
    })

    it('should compute consistent checksum for same data', async () => {
      const records = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
      ]

      const checksum1 = await computeChecksum(records)
      const checksum2 = await computeChecksum([...records])

      expect(checksum1.digest).toBe(checksum2.digest)
      expect(checksum1.rowCount).toBe(2)
    })

    it('should compute different checksums for different data', async () => {
      const records1 = [{ id: '1', name: 'Product 1' }]
      const records2 = [{ id: '2', name: 'Product 2' }]

      const checksum1 = await computeChecksum(records1)
      const checksum2 = await computeChecksum(records2)

      expect(checksum1.digest).not.toBe(checksum2.digest)
    })

    it('should handle dates correctly', async () => {
      const date = new Date('2024-01-01T00:00:00Z')
      const records = [{ id: '1', createdAt: date }]

      const checksum1 = await computeChecksum(records)
      const checksum2 = await computeChecksum([
        { id: '1', createdAt: new Date('2024-01-01T00:00:00Z') },
      ])

      expect(checksum1.digest).toBe(checksum2.digest)
    })

    it('should handle nested objects', async () => {
      const records = [
        {
          id: '1',
          product: {
            name: 'Widget',
            price: { amount: 100, currency: 'USD' },
          },
        },
      ]

      const checksum = await computeChecksum(records)
      expect(checksum.rowCount).toBe(1)
      expect(checksum.digest).toBeTruthy()
    })

    it('should ignore order of records (normalized)', async () => {
      const records1 = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ]
      const records2 = [
        { id: '2', name: 'B' },
        { id: '1', name: 'A' },
      ]

      const checksum1 = await computeChecksum(records1)
      const checksum2 = await computeChecksum(records2)

      expect(checksum1.digest).toBe(checksum2.digest)
    })
  })

  describe('verifyChecksum', () => {
    it('should verify matching checksums', () => {
      const checksum = { rowCount: 5, digest: 'abc123' }
      const result = verifyChecksum(checksum, checksum, 'products')

      expect(result.success).toBe(true)
      expect(result.message).toContain('✓')
      expect(result.message).toContain('products')
    })

    it('should detect row count mismatch', () => {
      const source = { rowCount: 5, digest: 'abc123' }
      const target = { rowCount: 6, digest: 'abc123' }
      const result = verifyChecksum(source, target, 'products')

      expect(result.success).toBe(false)
      expect(result.message).toContain('row count')
    })

    it('should detect digest mismatch', () => {
      const source = { rowCount: 5, digest: 'abc123' }
      const target = { rowCount: 5, digest: 'def456' }
      const result = verifyChecksum(source, target, 'products')

      expect(result.success).toBe(false)
      expect(result.message).toContain('digest')
    })
  })

  describe('Cross-engine migration', () => {
    it('should round-trip memory → sqlite → memory', async () => {
      // Create test data
      const testData = [
        {
          id: 'org-1',
          name: 'Test Org',
          email: 'org@test.com',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        },
      ]

      // Start with memory
      const memoryProvider1 = await createStorageProvider({ engine: 'memory' })
      await memoryProvider1.importAll(
        {
          format: 'pos.storage.export',
          formatVersion: 1,
          engine: 'memory',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          entities: [
            {
              entity: 'organizations',
              version: 1,
              records: testData,
            },
          ],
        },
        { mode: 'replace' },
      )

      // Export from memory
      const exported1 = await memoryProvider1.exportAll()
      const checksum1 = await computeChecksum(
        exported1.entities.find((e) => e.entity === 'organizations')?.records || [],
      )
      await memoryProvider1.close()

      // Import to sqlite
      const sqliteProvider = await createStorageProvider({ engine: 'sqlite' })
      await sqliteProvider.importAll(exported1, { mode: 'replace' })

      // Export from sqlite
      const exported2 = await sqliteProvider.exportAll()
      const checksum2 = await computeChecksum(
        exported2.entities.find((e) => e.entity === 'organizations')?.records || [],
      )
      await sqliteProvider.close()

      // Import to memory again
      const memoryProvider2 = await createStorageProvider({ engine: 'memory' })
      await memoryProvider2.importAll(exported2, { mode: 'replace' })

      // Export from memory
      const exported3 = await memoryProvider2.exportAll()
      const checksum3 = await computeChecksum(
        exported3.entities.find((e) => e.entity === 'organizations')?.records || [],
      )
      await memoryProvider2.close()

      // All checksums should match
      expect(checksum1.digest).toBe(checksum2.digest)
      expect(checksum2.digest).toBe(checksum3.digest)
      expect(checksum1.rowCount).toBe(1)
      expect(checksum2.rowCount).toBe(1)
      expect(checksum3.rowCount).toBe(1)
    })

    it('should detect data drift during migration', async () => {
      // Start with test data
      const testData = [
        { id: 'user-1', username: 'alice', email: 'alice@test.com' },
      ]

      const memoryProvider = await createStorageProvider({ engine: 'memory' })
      await memoryProvider.importAll(
        {
          format: 'pos.storage.export',
          formatVersion: 1,
          engine: 'memory',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          entities: [
            {
              entity: 'users',
              version: 1,
              records: testData,
            },
          ],
        },
        { mode: 'replace' },
      )

      // Export from memory
      const exported = await memoryProvider.exportAll()
      const sourceChecksum = await computeChecksum(exported.entities.find((e) => e.entity === 'users')?.records || [])
      await memoryProvider.close()

      // Modify the exported data to simulate corruption
      const corruptedData = [
        {
          id: 'user-1',
          username: 'bob', // Changed
          email: 'alice@test.com',
        },
      ]

      const targetChecksum = await computeChecksum(corruptedData)

      // Verify should detect the mismatch
      const result = verifyChecksum(sourceChecksum, targetChecksum, 'users')
      expect(result.success).toBe(false)
    })
  })
})
