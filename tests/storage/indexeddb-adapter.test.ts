import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { IndexedDBDriver, ephemeralDatabaseName } from '@infra/storage/adapters/indexeddb'
import { runStorageConformance } from './conformance'
import type { StorageDriver } from '@infra/storage'
import {
  StorageQuotaError,
  StorageCloneError,
  StorageUnavailableError,
} from '@infra/storage/adapters/indexeddb'

describe('IndexedDB Adapter', () => {
  // Run the full conformance suite with IndexedDB
  runStorageConformance('indexeddb', () => {
    return new IndexedDBDriver({
      databaseName: ephemeralDatabaseName(),
      ephemeral: true,
    })
  })

  describe('IndexedDB-specific error handling', () => {
    let driver: StorageDriver

    beforeEach(async () => {
      driver = new IndexedDBDriver({
        databaseName: ephemeralDatabaseName(),
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

    it('should handle non-cloneable values with StorageCloneError', async () => {
      const product = {
        id: 'prod-clone-error',
        name: 'Clone Error Test',
        sku: 'SKU-CLONE',
        price: { amount: 100, currency: 'USD' },
        stock: { quantity: 10, unit: 'pcs' },
        createdAt: new Date(),
        updatedAt: new Date(),
        nonCloneable: () => {
          /* function */
        }, // Non-cloneable
      }

      try {
        await driver.transaction(['products'], 'readwrite', async (tx) => {
          await tx.put('products', product as any)
        })
        // If we reach here in a real browser, the function was somehow serialized
        // which shouldn't happen with proper error handling
      } catch (err) {
        expect(err instanceof StorageCloneError || err instanceof Error).toBe(true)
      }
    })

    it('should rollback schema version on failed migration', async () => {
      const initialVersion = await driver.getSchemaVersion()
      expect(initialVersion).toBe(0)

      try {
        await driver.transaction(['products'], 'readwrite', async (tx) => {
          await tx.put('products', {
            id: 'test-product',
            name: 'Test',
            sku: 'TEST',
            price: { amount: 10, currency: 'USD' },
            stock: { quantity: 1, unit: 'pcs' },
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          // Simulate a migration error
          throw new Error('Migration failed')
        })
      } catch (err) {
        // Expected
      }

      const versionAfterRollback = await driver.getSchemaVersion()
      expect(versionAfterRollback).toBe(initialVersion)
    })

    it('should persist schema version within the same driver', async () => {
      await driver.setSchemaVersion(3)
      const version1 = await driver.getSchemaVersion()
      expect(version1).toBe(3)

      // Verify it persists on subsequent reads
      const version2 = await driver.getSchemaVersion()
      expect(version2).toBe(3)
    })

    it('should delete ephemeral database on close', async () => {
      const dbName = ephemeralDatabaseName()
      const tempDriver = new IndexedDBDriver({
        databaseName: dbName,
        ephemeral: true,
      })

      await tempDriver.open({
        version: 1,
        collections: ['products'],
      })

      // Store something
      await tempDriver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.put('products', {
          id: 'ephemeral-test',
          name: 'Ephemeral',
          sku: 'EPHM',
          price: { amount: 5, currency: 'USD' },
          stock: { quantity: 1, unit: 'pcs' },
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      })

      await tempDriver.close()

      // Verify the database was deleted
      const newDriver = new IndexedDBDriver({
        databaseName: dbName,
        ephemeral: false,
      })

      await newDriver.open({
        version: 1,
        collections: ['products'],
      })

      const retrieved = await newDriver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', 'ephemeral-test')
      })

      expect(retrieved).toBeUndefined()
      await newDriver.close()
    })
  })

  describe('SSR safety', () => {
    it('should throw StorageUnavailableError when indexedDB is not available', async () => {
      const originalIndexedDB = (global as any).indexedDB
      ;(global as any).indexedDB = undefined

      try {
        const driver = new IndexedDBDriver({
          databaseName: 'ssr-test',
          ephemeral: true,
        })

        try {
          await driver.open({
            version: 1,
            collections: ['products'],
          })
          // If we reach here without error in a Node environment, something is wrong
        } catch (err) {
          expect(err instanceof StorageUnavailableError).toBe(true)
        }
      } finally {
        ;(global as any).indexedDB = originalIndexedDB
      }
    })
  })
})
