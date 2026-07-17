import { describe, it, expect, beforeEach } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import type { ConformanceAdapter } from '../types'
import { createUlidGenerator } from '../ulid'
import { normalizeExport } from '../normalize'
import { makeProduct } from '../fixtures'

export function runUlidKeysSuite(getProvider: () => StorageProvider, adapter: ConformanceAdapter): void {
  describe('ULID keys preservation and ordering', () => {
    let ulidGen: () => string

    beforeEach(() => {
      ulidGen = createUlidGenerator()
    })

    it('should preserve ULID keys byte-for-byte through round-trip', async () => {
      await getProvider().withTransaction(async (repos) => {
        const ulid = ulidGen()
        const product = makeProduct({ id: ulid })
        await repos.inventory.save(product)

        const found = await repos.inventory.findById(ulid)
        expect(found?.id).toBe(ulid)
        expect(found?.id).toEqual(product.id)
      })
    })

    it('should preserve ULID ordering (lexicographic == chronological)', async () => {
      await getProvider().withTransaction(async (repos) => {
        const ulids: string[] = []
        const products: ReturnType<typeof makeProduct>[] = []

        // Create multiple ULIDs
        for (let i = 0; i < 5; i++) {
          const ulid = ulidGen()
          ulids.push(ulid)
          const product = makeProduct({ id: ulid, name: `Product ${i}` })
          products.push(product)
          await repos.inventory.save(product)
        }

        // Fetch all and verify order matches creation order
        const all = await repos.inventory.listAll()
        const allIds = all.map((p) => p.id)

        // Sort ULIDs lexicographically
        const sortedUlids = [...ulids].sort()
        expect(allIds).toEqual(sortedUlids)
      })
    })

    it('should preserve ULID keys through export/import', async () => {
      const ulid = ulidGen()
      const product = makeProduct({ id: ulid })

      // Save to provider
      await getProvider().withTransaction(async (repos) => {
        await repos.inventory.save(product)
      })

      // Export
      const exported = await getProvider().exportAll()

      // Import into fresh provider
      const provider2 = await adapter.createProvider()
      await provider2.importAll(exported)

      // Verify key is preserved
      await provider2.withTransaction(async (repos) => {
        const found = await repos.inventory.findById(ulid)
        expect(found?.id).toBe(ulid)
      })

      await provider2.close()
    })

    it('should preserve order through export/import', async () => {
      const ulids: string[] = []
      const ids: string[] = []

      // Create and save multiple ULIDs
      await getProvider().withTransaction(async (repos) => {
        for (let i = 0; i < 3; i++) {
          const ulid = ulidGen()
          ulids.push(ulid)
          ids.push(ulid)
          const product = makeProduct({ id: ulid })
          await repos.inventory.save(product)
        }
      })

      // Export
      const exported = await getProvider().exportAll()

      // Import into fresh provider
      const provider2 = await adapter.createProvider()
      await provider2.importAll(exported)

      // Verify order is preserved
      await provider2.withTransaction(async (repos) => {
        const all = await repos.inventory.listAll()
        const allIds = all.map((p) => p.id)
        const sortedIds = [...ids].sort()
        expect(allIds).toEqual(sortedIds)
      })

      await provider2.close()
    })

    it('should maintain ULID lexicographic ordering through multiple operations', async () => {
      await getProvider().withTransaction(async (repos) => {
        const ulids: string[] = []

        // Generate and save ULIDs
        for (let i = 0; i < 10; i++) {
          const ulid = ulidGen()
          ulids.push(ulid)
          const product = makeProduct({ id: ulid })
          await repos.inventory.save(product)
        }

        // Verify they come back in lexicographic order
        const allProducts = await repos.inventory.listAll()
        const resultIds = allProducts.map((p) => p.id)
        const expectedOrder = [...ulids].sort()

        expect(resultIds).toEqual(expectedOrder)

        // Verify monotonicity: each ULID is greater than the previous
        for (let i = 1; i < resultIds.length; i++) {
          expect(resultIds[i]!.localeCompare(resultIds[i - 1]!)).toBeGreaterThan(0)
        }
      })
    })
  })
}
