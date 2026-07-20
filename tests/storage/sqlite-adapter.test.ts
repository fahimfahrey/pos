import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SqliteDriver } from '@infra/storage/adapters/sqlite'
import { runStorageConformance } from './conformance'
import type { StorageDriver } from '@infra/storage'

describe('SQLite Adapter', () => {
  // Run the full conformance suite with SQLite
  runStorageConformance('sqlite', () => {
    return new SqliteDriver({
      ephemeral: true,
    })
  })

  describe('SQLite-specific behavior', () => {
    let driver: StorageDriver

    beforeEach(async () => {
      driver = new SqliteDriver({
        ephemeral: true,
      })
      await driver.open({
        version: 1,
        collections: ['products'],
      })
    })

    afterEach(async () => {
      await driver.close()
    })

    it('should handle JSON serialization correctly', async () => {
      const product = {
        id: 'prod-json-test',
        name: 'JSON Test Product',
        sku: 'SKU-JSON',
        price: { amount: 100.50, currency: 'USD' },
        stock: { quantity: 10, unit: 'pcs' },
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      }

      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.put('products', product)
      })

      const retrieved = await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get<any>('products', 'prod-json-test')
      })

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('JSON Test Product')
      expect(retrieved?.price.amount).toBe(100.50)
    })

    it('should rollback transaction on error', async () => {
      const testId = 'prod-rollback-test'

      try {
        await driver.transaction(['products'], 'readwrite', async (tx) => {
          await tx.put('products', {
            id: testId,
            name: 'Rollback Test',
            sku: 'SKU-ROLLBACK',
            price: { amount: 50, currency: 'USD' },
            stock: { quantity: 5, unit: 'pcs' },
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          // Simulate a transaction error
          throw new Error('Transaction error')
        })
      } catch (err) {
        // Expected
      }

      // Verify the record was not persisted
      const retrieved = await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', testId)
      })

      expect(retrieved).toBeUndefined()
    })

    it('should persist schema version within the same driver', async () => {
      await driver.setSchemaVersion(5)
      const version1 = await driver.getSchemaVersion()
      expect(version1).toBe(5)

      // Verify it persists on subsequent reads
      const version2 = await driver.getSchemaVersion()
      expect(version2).toBe(5)
    })

    it('should handle multiple records in a single collection', async () => {
      const records = [
        {
          id: 'prod-1',
          name: 'Product 1',
          sku: 'SKU1',
          price: { amount: 10, currency: 'USD' },
          stock: { quantity: 5, unit: 'pcs' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prod-2',
          name: 'Product 2',
          sku: 'SKU2',
          price: { amount: 20, currency: 'USD' },
          stock: { quantity: 10, unit: 'pcs' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prod-3',
          name: 'Product 3',
          sku: 'SKU3',
          price: { amount: 30, currency: 'USD' },
          stock: { quantity: 15, unit: 'pcs' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      await driver.transaction(['products'], 'readwrite', async (tx) => {
        for (const record of records) {
          await tx.put('products', record)
        }
      })

      const all = await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.getAll('products')
      })

      expect(all).toHaveLength(3)
      expect(all.map((p: any) => p.id).sort()).toEqual(['prod-1', 'prod-2', 'prod-3'])
    })

    it('should handle delete operations correctly', async () => {
      const testId = 'prod-delete-test'

      // Insert a record
      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.put('products', {
          id: testId,
          name: 'Delete Test',
          sku: 'SKU-DELETE',
          price: { amount: 25, currency: 'USD' },
          stock: { quantity: 3, unit: 'pcs' },
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      })

      // Verify it exists
      let retrieved = await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', testId)
      })
      expect(retrieved).toBeDefined()

      // Delete it
      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.delete('products', testId)
      })

      // Verify it's gone
      retrieved = await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', testId)
      })
      expect(retrieved).toBeUndefined()
    })

    it('should support readonly transactions without locking', async () => {
      const testId = 'prod-readonly-test'

      // Insert a record
      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.put('products', {
          id: testId,
          name: 'Readonly Test',
          sku: 'SKU-RO',
          price: { amount: 15, currency: 'USD' },
          stock: { quantity: 2, unit: 'pcs' },
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      })

      // Multiple readonly transactions should work concurrently
      const results = await Promise.all([
        driver.transaction(['products'], 'readonly', async (tx) => {
          return tx.get('products', testId)
        }),
        driver.transaction(['products'], 'readonly', async (tx) => {
          return tx.getAll('products')
        }),
      ])

      expect(results[0]).toBeDefined()
      expect(results[1]).toHaveLength(1)
    })
  })
})
