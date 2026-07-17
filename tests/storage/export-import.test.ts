import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createStorageProvider } from '@infra/storage'
import type { StorageProvider } from '@infra/storage'

describe('Export/Import', () => {
  let provider: StorageProvider

  beforeEach(async () => {
    provider = await createStorageProvider({ engine: 'memory' })
  })

  afterEach(async () => {
    await provider.close()
  })

  it('should export and import with Date fidelity', async () => {
    const testDate = new Date('2024-01-15T10:30:45.123Z')

    const order: any = {
      id: 'order-date',
      status: 'open',
      lines: [],
      total: { amount: 100, currency: 'USD' },
      createdAt: testDate,
      updatedAt: testDate,
    }

    await provider.withTransaction(async (repos) => {
      await repos.sales.save(order as any)
    })

    const exported = await provider.exportAll()
    const provider2 = await createStorageProvider({ engine: 'memory' })

    await provider2.importAll(exported)

    const retrieved = await provider2.withTransaction(async (repos) => {
      return repos.sales.findById('order-date')
    })

    expect(retrieved?.createdAt).toBeInstanceOf(Date)
    expect((retrieved?.createdAt as Date).toISOString()).toBe(testDate.toISOString())
    expect((retrieved?.updatedAt as Date).getTime()).toBe(testDate.getTime())

    await provider2.close()
  })

  it('should export with correct envelope format', async () => {
    const product = {
      id: 'prod-format',
      name: 'Format Test',
      sku: 'SKU-FMT',
      price: { amount: 25, currency: 'USD' },
      stock: { quantity: 3, unit: 'pcs' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    await provider.withTransaction(async (repos) => {
      await repos.inventory.save(product)
    })

    const exported = await provider.exportAll()

    expect(exported.format).toBe('pos.storage.export')
    expect(exported.formatVersion).toBe(1)
    expect(exported.engine).toBe('memory')
    expect(exported.schemaVersion).toBe(2)
    expect(typeof exported.exportedAt).toBe('string')
    expect(Array.isArray(exported.entities)).toBe(true)

    const productsEnvelope = exported.entities.find((e) => e.entity === 'products')
    expect(productsEnvelope).toBeDefined()
    expect(productsEnvelope?.version).toBe(1)
    expect(Array.isArray(productsEnvelope?.records)).toBe(true)
  })

  it('should import in replace mode (clears existing)', async () => {
    const product1 = {
      id: 'prod-replace-1',
      name: 'Will Be Replaced',
      sku: 'SKU-R1',
      price: { amount: 10, currency: 'USD' },
      stock: { quantity: 1, unit: 'pcs' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const product2 = {
      id: 'prod-replace-2',
      name: 'Import Product',
      sku: 'SKU-R2',
      price: { amount: 20, currency: 'USD' },
      stock: { quantity: 2, unit: 'pcs' },
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    }

    // Add product1 to provider
    await provider.withTransaction(async (repos) => {
      await repos.inventory.save(product1)
    })

    // Export with only product2
    const provider2 = await createStorageProvider({ engine: 'memory' })
    await provider2.withTransaction(async (repos) => {
      await repos.inventory.save(product2)
    })
    const exported = await provider2.exportAll()
    await provider2.close()

    // Import in replace mode into original provider
    await provider.importAll(exported, { mode: 'replace' })

    // Check that product1 is gone and product2 is present
    const retrieved1 = await provider.withTransaction(async (repos) => {
      return repos.inventory.findById('prod-replace-1')
    })

    const retrieved2 = await provider.withTransaction(async (repos) => {
      return repos.inventory.findById('prod-replace-2')
    })

    expect(retrieved1).toBeNull()
    expect(retrieved2).toBeDefined()
  })

  it('should import in merge mode (upserts by id)', async () => {
    const product1 = {
      id: 'prod-merge-1',
      name: 'Original',
      sku: 'SKU-M1',
      price: { amount: 10, currency: 'USD' },
      stock: { quantity: 1, unit: 'pcs' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const product1Updated = {
      id: 'prod-merge-1',
      name: 'Updated',
      sku: 'SKU-M1-NEW',
      price: { amount: 15, currency: 'USD' },
      stock: { quantity: 5, unit: 'pcs' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    }

    // Add product1
    await provider.withTransaction(async (repos) => {
      await repos.inventory.save(product1)
    })

    // Export updated version
    const provider2 = await createStorageProvider({ engine: 'memory' })
    await provider2.withTransaction(async (repos) => {
      await repos.inventory.save(product1Updated)
    })
    const exported = await provider2.exportAll()
    await provider2.close()

    // Import in merge mode
    await provider.importAll(exported, { mode: 'merge' })

    // Check that product1 is updated
    const retrieved = await provider.withTransaction(async (repos) => {
      return repos.inventory.findById('prod-merge-1')
    })

    expect(retrieved?.name).toBe('Updated')
    expect(retrieved?.sku).toBe('SKU-M1-NEW')
  })

  it('should reject invalid import format', async () => {
    const invalidExport = {
      format: 'invalid.format',
      formatVersion: 1,
      engine: 'memory',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      entities: [],
    }

    await expect(provider.importAll(invalidExport as any)).rejects.toThrow('Invalid export format')
  })

  it('should reject unsupported format version', async () => {
    const invalidExport = {
      format: 'pos.storage.export',
      formatVersion: 999,
      engine: 'memory',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      entities: [],
    }

    await expect(provider.importAll(invalidExport as any)).rejects.toThrow('Unsupported format version')
  })

  it('should cross-engine migration simulation', async () => {
    const product = {
      id: 'prod-cross',
      name: 'Cross Engine',
      sku: 'SKU-CROSS',
      price: { amount: 50, currency: 'USD' },
      stock: { quantity: 10, unit: 'pcs' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const customer = {
      id: 'cust-cross',
      email: 'test@example.com',
      phone: '555-1234',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    // Add to source provider (memory A)
    await provider.withTransaction(async (repos) => {
      await repos.inventory.save(product)
      await repos.customers.save(customer)
    })

    // Export from source
    const exported = await provider.exportAll()

    // Create destination provider (memory B) and import
    const provider2 = await createStorageProvider({ engine: 'memory' })
    await provider2.importAll(exported)

    // Verify both collections migrated
    const retrievedProduct = await provider2.withTransaction(async (repos) => {
      return repos.inventory.findById('prod-cross')
    })

    const retrievedCustomer = await provider2.withTransaction(async (repos) => {
      return repos.customers.findById('cust-cross')
    })

    expect(retrievedProduct?.name).toBe('Cross Engine')
    expect(retrievedCustomer?.email).toBe('test@example.com')

    await provider2.close()
  })
})
