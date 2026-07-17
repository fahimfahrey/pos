import { describe, it, expect } from 'vitest'
import { MemoryStorageDriver } from '@infra/storage/adapters/memory/memory-driver'
import { runStorageConformance } from './conformance'
import { createStorageProvider } from '@infra/storage'

runStorageConformance('memory', () => new MemoryStorageDriver())

describe('MemoryStorageDriver specific', () => {
  it('should create a storage provider with memory engine', async () => {
    const provider = await createStorageProvider({ engine: 'memory' })
    expect(provider.engine).toBe('memory')
    await provider.close()
  })

  it('should perform transaction writes within repository context', async () => {
    const provider = await createStorageProvider({ engine: 'memory' })

    const order: any = {
      id: 'test-order',
      status: 'open',
      lines: [],
      total: { amount: 100, currency: 'USD' },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await provider.withTransaction(async (repos) => {
      await repos.sales.save(order as any)
    })

    const retrieved = await provider.withTransaction(async (repos) => {
      return repos.sales.findById('test-order')
    })

    expect(retrieved).toBeDefined()
    expect(retrieved?.status).toBe('open')

    await provider.close()
  })

  it('should export and import data', async () => {
    const provider = await createStorageProvider({ engine: 'memory' })

    const product = {
      id: 'prod-export',
      name: 'Export Test',
      sku: 'SKU-EXP',
      price: { amount: 50, currency: 'USD' },
      stock: { quantity: 5, unit: 'pcs' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    await provider.withTransaction(async (repos) => {
      await repos.inventory.save(product)
    })

    const exported = await provider.exportAll()

    // Create a new provider to import into
    const provider2 = await createStorageProvider({ engine: 'memory' })

    await provider2.importAll(exported)

    const retrieved = await provider2.withTransaction(async (repos) => {
      return repos.inventory.findById('prod-export')
    })

    expect(retrieved).toBeDefined()
    expect(retrieved?.name).toBe('Export Test')

    await provider.close()
    await provider2.close()
  })
})
