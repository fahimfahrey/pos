import { describe, it, expect } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import type { ConformanceAdapter } from '../types'
import { seedAll } from '../fixtures'
import { normalizeExport } from '../normalize'

export function runExportImportSuite(
  getProvider: () => StorageProvider,
  adapter: ConformanceAdapter,
  allAdapters: ConformanceAdapter[],
): void {
  describe('Export/import fidelity', () => {
    it('should export and import within same adapter', async () => {
      // Seed initial data
      await getProvider().withTransaction(async (repos) => {
        await seedAll(repos, { orgId: 'org-test' })
      })

      // Export
      const exported = await getProvider().exportAll()

      // Import into fresh provider instance
      const provider2 = await adapter.createProvider()
      try {
        await provider2.importAll(exported)

        // Verify data matches
        await provider2.withTransaction(async (repos: any) => {
          const product = await repos.inventory.findById('product-001')
          expect(product).not.toBeNull()
          expect(product?.name).toBe('Test Product')

          const customer = await repos.customers.findById('customer-001')
          expect(customer).not.toBeNull()
          expect(customer?.email).toBe('customer@test.com')
        })
      } finally {
        await provider2.close()
      }
    })

    it('should preserve Dates as Date objects through export/import', async () => {
      await getProvider().withTransaction(async (repos) => {
        await seedAll(repos)
      })

      const exported = await getProvider().exportAll()

      const provider2 = await adapter.createProvider()
      try {
        await provider2.importAll(exported)

        await provider2.withTransaction(async (repos: any) => {
          const product = await repos.inventory.findById('product-001')
          expect(product?.createdAt).toBeInstanceOf(Date)
          expect(product?.updatedAt).toBeInstanceOf(Date)

          const customer = await repos.customers.findById('customer-001')
          expect(customer?.createdAt).toBeInstanceOf(Date)
          expect(customer?.updatedAt).toBeInstanceOf(Date)
        })
      } finally {
        await provider2.close()
      }
    })

    it('should deep-equal normalized exports for same data', async () => {
      // Seed data in provider
      await getProvider().withTransaction(async (repos) => {
        await seedAll(repos, { orgId: 'org-1' })
      })

      // Export
      const exported1 = await getProvider().exportAll()
      const normalized1 = normalizeExport(exported1)

      // Import and re-export
      const provider2 = await adapter.createProvider()
      try {
        await provider2.importAll(exported1)
        const exported2 = await provider2.exportAll()
        const normalized2 = normalizeExport(exported2)

        // Normalized exports should deep-equal
        expect(normalized2).toEqual(normalized1)
      } finally {
        await provider2.close()
      }
    })

    it('should preserve key byte-for-byte through export/import', async () => {
      const testId = 'unique-test-id-12345678901234'

      await getProvider().withTransaction(async (repos) => {
        const product = {
          id: testId,
          name: 'Test',
          sku: 'TEST',
          price: { amount: 99.99, currency: 'USD' },
          stock: { quantity: 10, unit: 'unit' },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await repos.inventory.save(product)
      })

      const exported = await getProvider().exportAll()

      const provider2 = await adapter.createProvider()
      try {
        await provider2.importAll(exported)

        await provider2.withTransaction(async (repos: any) => {
          const found = await repos.inventory.findById(testId)
          expect(found?.id).toBe(testId)
          expect(found?.id).toEqual(testId)
        })
      } finally {
        await provider2.close()
      }
    })

    it('should handle replace mode import', async () => {
      // Initial data
      await getProvider().withTransaction(async (repos) => {
        await seedAll(repos)
      })

      const exported1 = await getProvider().exportAll()

      // Import with replace mode
      const provider2 = await adapter.createProvider()
      try {
        await provider2.importAll(exported1, { mode: 'replace' })

        // Verify data
        await provider2.withTransaction(async (repos: any) => {
          const product = await repos.inventory.findById('product-001')
          expect(product).not.toBeNull()
        })
      } finally {
        await provider2.close()
      }
    })

    it('should maintain normalization across export cycles', async () => {
      await getProvider().withTransaction(async (repos) => {
        await seedAll(repos, { orgId: 'org-norm-test' })
      })

      // Export -> normalize
      const exp1 = await getProvider().exportAll()
      const norm1 = normalizeExport(exp1)

      // Import -> export -> normalize
      const provider2 = await adapter.createProvider()
      try {
        await provider2.importAll(exp1)
        const exp2 = await provider2.exportAll()
        const norm2 = normalizeExport(exp2)

        // Import -> export -> normalize again
        const provider3 = await adapter.createProvider()
        try {
          await provider3.importAll(exp2)
          const exp3 = await provider3.exportAll()
          const norm3 = normalizeExport(exp3)

          // All normalized forms should match
          expect(norm2).toEqual(norm1)
          expect(norm3).toEqual(norm1)
        } finally {
          await provider3.close()
        }
      } finally {
        await provider2.close()
      }
    })
  })
}
