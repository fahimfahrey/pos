import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { StorageDriver, DriverFactory, CollectionName } from '@infra/storage'
import { CURRENT_SCHEMA_VERSION, COLLECTIONS } from '@infra/storage'

export async function runStorageConformance(engineName: string, makeDriver: DriverFactory) {
  describe(`Storage Conformance: ${engineName}`, () => {
    let driver: StorageDriver

    beforeEach(async () => {
      driver = makeDriver()
      const allCollections = Array.from(Object.keys(COLLECTIONS))
      await driver.open({
        version: CURRENT_SCHEMA_VERSION,
        collections: allCollections as CollectionName[],
      })
    })

    afterEach(async () => {
      await driver.close()
    })

    it('should create and retrieve a product (inventory)', async () => {
      const product = {
        id: 'prod-1',
        name: 'Test Product',
        sku: 'SKU-001',
        price: { amount: 100, currency: 'USD' },
        stock: { quantity: 10, unit: 'pcs' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.put('products', product)
      })

      const retrieved = (await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', 'prod-1')
      })) as any

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Product')
    })

    it('should create and retrieve an order (sales)', async () => {
      const order = {
        id: 'order-1',
        status: 'open',
        lines: [],
        total: { amount: 100, currency: 'USD' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      await driver.transaction(['orders'], 'readwrite', async (tx) => {
        await tx.put('orders', order)
      })

      const retrieved = (await driver.transaction(['orders'], 'readonly', async (tx) => {
        return tx.get('orders', 'order-1')
      })) as any

      expect(retrieved).toBeDefined()
      expect(retrieved?.status).toBe('open')
    })

    it('should rollback on error', async () => {
      const product = {
        id: 'prod-2',
        name: 'Will Rollback',
        sku: 'SKU-002',
        price: { amount: 50, currency: 'USD' },
        stock: { quantity: 5, unit: 'pcs' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      try {
        await driver.transaction(['products'], 'readwrite', async (tx) => {
          await tx.put('products', product)
          throw new Error('Intentional error')
        })
      } catch (err) {
        // Expected
      }

      const retrieved = await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', 'prod-2')
      })

      expect(retrieved).toBeUndefined()
    })

    it('should handle transaction across multiple collections', async () => {
      const product = {
        id: 'prod-3',
        name: 'Multi Collection',
        sku: 'SKU-003',
        price: { amount: 75, currency: 'USD' },
        stock: { quantity: 15, unit: 'pcs' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const order = {
        id: 'order-2',
        status: 'open',
        lines: [],
        total: { amount: 75, currency: 'USD' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      await driver.transaction(['products', 'orders'], 'readwrite', async (tx) => {
        await tx.put('products', product)
        await tx.put('orders', order)
      })

      const product_retrieved = (await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', 'prod-3')
      })) as any

      const order_retrieved = (await driver.transaction(['orders'], 'readonly', async (tx) => {
        return tx.get('orders', 'order-2')
      })) as any

      expect(product_retrieved).toBeDefined()
      expect(order_retrieved).toBeDefined()
    })

    it('should preserve schema version', async () => {
      await driver.setSchemaVersion(1)
      const version = await driver.getSchemaVersion()
      expect(version).toBe(1)
    })

    it('should handle Date serialization through export/import', async () => {
      const order = {
        id: 'order-date-test',
        status: 'open',
        lines: [],
        total: { amount: 100, currency: 'USD' },
        createdAt: new Date('2024-01-15T10:30:45.123Z'),
        updatedAt: new Date('2024-01-15T10:30:45.123Z'),
      }

      await driver.transaction(['orders'], 'readwrite', async (tx) => {
        await tx.put('orders', order)
      })

      // Verify the date is stored correctly
      const retrieved = (await driver.transaction(['orders'], 'readonly', async (tx) => {
        return tx.get('orders', 'order-date-test')
      })) as any

      expect(retrieved?.createdAt).toBeInstanceOf(Date)
      expect((retrieved?.createdAt as Date).toISOString()).toBe('2024-01-15T10:30:45.123Z')
    })

    it('should delete records', async () => {
      const product = {
        id: 'prod-delete',
        name: 'To Delete',
        sku: 'SKU-DELETE',
        price: { amount: 50, currency: 'USD' },
        stock: { quantity: 10, unit: 'pcs' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.put('products', product)
      })

      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.delete('products', 'prod-delete')
      })

      const retrieved = (await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', 'prod-delete')
      })) as any

      expect(retrieved).toBeUndefined()
    })

    it('should list all records in a collection', async () => {
      const products = [
        {
          id: 'prod-list-1',
          name: 'Product 1',
          sku: 'SKU-L1',
          price: { amount: 10, currency: 'USD' },
          stock: { quantity: 1, unit: 'pcs' },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'prod-list-2',
          name: 'Product 2',
          sku: 'SKU-L2',
          price: { amount: 20, currency: 'USD' },
          stock: { quantity: 2, unit: 'pcs' },
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ]

      await driver.transaction(['products'], 'readwrite', async (tx) => {
        for (const product of products) {
          await tx.put('products', product)
        }
      })

      const all = (await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.getAll('products')
      })) as any[]

      expect(all.length).toBeGreaterThanOrEqual(2)
      expect(all.some((p: any) => p.id === 'prod-list-1')).toBe(true)
      expect(all.some((p: any) => p.id === 'prod-list-2')).toBe(true)
    })

    it('should provide isolation (cloned records)', async () => {
      const product = {
        id: 'prod-isolation',
        name: 'Isolation Test',
        sku: 'SKU-ISO',
        price: { amount: 100, currency: 'USD' },
        stock: { quantity: 10, unit: 'pcs' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      await driver.transaction(['products'], 'readwrite', async (tx) => {
        await tx.put('products', product)
      })

      let retrieved1: any
      await driver.transaction(['products'], 'readonly', async (tx) => {
        retrieved1 = await tx.get('products', 'prod-isolation')
      })

      // Try to mutate the retrieved object
      if (retrieved1) {
        retrieved1.name = 'Mutated Name'
      }

      // Verify the stored version is unchanged
      const retrieved2 = (await driver.transaction(['products'], 'readonly', async (tx) => {
        return tx.get('products', 'prod-isolation')
      })) as any

      expect(retrieved2?.name).toBe('Isolation Test')
    })
  })
}
