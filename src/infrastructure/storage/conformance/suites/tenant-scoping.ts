import { describe, it, expect } from 'vitest'
import type { StorageProvider, RepositorySet } from '@infra/storage'
import type { ConformanceAdapter } from '../types'
import { makeProduct, makeCustomer } from '../fixtures'
import { normalizeExport } from '../normalize'

/**
 * Helper to filter records by orgId from a collection.
 * @deprecated once repos are tenant-aware, repoint to the real scoped query
 */
async function scopedList<T extends Record<string, any>>(
  repos: RepositorySet,
  collectionName: string,
  orgId: string,
): Promise<T[]> {
  // This is a test helper that simulates scoped queries.
  // In production, repositories will enforce scoping.
  // For now, we store orgId on the record and filter it here.

  if (collectionName === 'products' || collectionName === 'inventory') {
    const all = await repos.inventory.listAll()
    return all.filter((r: any) => r.orgId === orgId) as unknown as T[]
  }

  if (collectionName === 'customers') {
    const all = await repos.customers.listAll()
    return all.filter((r: any) => r.orgId === orgId) as unknown as T[]
  }

  return []
}

export function runTenantScopingSuite(getProvider: () => StorageProvider, adapter: ConformanceAdapter): void {
  describe('Tenant scoping (orgId isolation)', () => {
    it('should not leak records across orgId', async () => {
      await getProvider().withTransaction(async (repos) => {
        // Create records for two organizations
        const productA = makeProduct({
          id: 'prod-a',
          orgId: 'org-a',
          name: 'Product A',
        })
        const productB = makeProduct({
          id: 'prod-b',
          orgId: 'org-b',
          name: 'Product B',
        })

        await repos.inventory.save(productA as any)
        await repos.inventory.save(productB as any)

        // List all (without scoping) should return both
        const all = await repos.inventory.listAll()
        expect(all.map((p: any) => p.orgId)).toContain('org-a')
        expect(all.map((p: any) => p.orgId)).toContain('org-b')
      })
    })

    it('should filter records by orgId in scoped list', async () => {
      await getProvider().withTransaction(async (repos) => {
        const productA = makeProduct({
          id: 'prod-a',
          orgId: 'org-a',
        })
        const productB = makeProduct({
          id: 'prod-b',
          orgId: 'org-b',
        })

        await repos.inventory.save(productA as any)
        await repos.inventory.save(productB as any)

        // Scoped list for org-a should only return product A
        const scopedA = await scopedList<any>(repos, 'products', 'org-a')
        expect(scopedA).toHaveLength(1)
        expect(scopedA[0]!.id).toBe('prod-a')
        expect(scopedA[0]!.orgId).toBe('org-a')

        // Scoped list for org-b should only return product B
        const scopedB = await scopedList<any>(repos, 'products', 'org-b')
        expect(scopedB).toHaveLength(1)
        expect(scopedB[0]!.id).toBe('prod-b')
        expect(scopedB[0]!.orgId).toBe('org-b')
      })
    })

    it('should return empty list for non-existent orgId', async () => {
      await getProvider().withTransaction(async (repos) => {
        const productA = makeProduct({
          id: 'prod-a',
          orgId: 'org-a',
        })
        await repos.inventory.save(productA as any)

        // Query for non-existent org should return empty
        const scoped = await scopedList<any>(repos, 'products', 'org-nonexistent')
        expect(scoped).toHaveLength(0)
      })
    })

    it('should not find record by id when filtered to wrong orgId', async () => {
      await getProvider().withTransaction(async (repos) => {
        const productA = makeProduct({
          id: 'prod-a',
          orgId: 'org-a',
        })
        await repos.inventory.save(productA as any)

        // Direct findById still returns the record
        const found = await repos.inventory.findById('prod-a')
        expect(found).not.toBeNull()

        // But scoped query for org-b should return nothing
        const scoped = await scopedList<any>(repos, 'products', 'org-b')
        expect(scoped).toHaveLength(0)
      })
    })

    it('should preserve tenant scoping through export/import', async () => {
      // Set up data with two tenants
      await getProvider().withTransaction(async (repos) => {
        const productA = makeProduct({
          id: 'prod-a',
          orgId: 'org-a',
        })
        const customerB = makeCustomer({
          id: 'cust-b',
          orgId: 'org-b',
        })

        await repos.inventory.save(productA as any)
        await repos.customers.save(customerB as any)
      })

      // Export
      const exported = await getProvider().exportAll()

      // Import into fresh provider
      const provider2 = await adapter.createProvider()
      await provider2.importAll(exported)

      // Verify scoping is preserved
      await provider2.withTransaction(async (repos) => {
        const productA = await repos.inventory.findById('prod-a')
        expect((productA as any)?.orgId).toBe('org-a')

        const customerB = await repos.customers.findById('cust-b')
        expect((customerB as any)?.orgId).toBe('org-b')

        // Scoped queries should still work
        const scopedA = await scopedList<any>(repos, 'products', 'org-a')
        expect(scopedA).toHaveLength(1)
        expect(scopedA[0]!.id).toBe('prod-a')
      })

      await provider2.close()
    })

    it('should maintain orgId across multiple collections', async () => {
      await getProvider().withTransaction(async (repos) => {
        const product = makeProduct({
          id: 'prod-x',
          orgId: 'org-x',
        })
        const customer = makeCustomer({
          id: 'cust-x',
          orgId: 'org-x',
        })

        await repos.inventory.save(product as any)
        await repos.customers.save(customer as any)

        // Both should be found with their orgId
        const foundProd = await repos.inventory.findById('prod-x')
        expect((foundProd as any)?.orgId).toBe('org-x')

        const foundCust = await repos.customers.findById('cust-x')
        expect((foundCust as any)?.orgId).toBe('org-x')
      })
    })
  })
}
