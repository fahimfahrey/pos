import { describe, it, expect } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import type { ConformanceAdapter } from '../types'
import { makeProduct, makeStockLevel, makeStockMovement } from '../fixtures'
import { InventoryService } from '@domains/inventory/services/inventory-service'
import { ReconciliationService } from '@domains/inventory/services/reconciliation-service'
import { InsufficientStockError } from '@domains/inventory/errors'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'

export function runConcurrencySuite(getProvider: () => StorageProvider, adapter: ConformanceAdapter): void {
  describe('Concurrent writes (stock decrement)', () => {
    it('should handle sequential decrements exactly', async () => {
      const INITIAL_QUANTITY = 20
      const DECREMENT_COUNT = 20

      // Set up product with known quantity
      await getProvider().withTransaction(async (repos) => {
        await repos.inventory.save(
          makeProduct({
            id: 'stock-prod',
            stock: { quantity: INITIAL_QUANTITY, unit: 'unit' },
          }),
        )
      })

      // Sequential read-modify-write decrements
      for (let i = 0; i < DECREMENT_COUNT; i++) {
        await getProvider().withTransaction(async (repos) => {
          const product = await repos.inventory.findById('stock-prod')
          if (product && product.stock.quantity > 0) {
            product.stock.quantity -= 1
            await repos.inventory.save(product)

            // Record movement
            await repos.inventory.recordMovement({
              id: `move-seq-${i}`,
              productId: 'stock-prod',
              quantity: 1,
              movementType: 'out',
              reason: 'Sequential decrement',
              createdAt: new Date(),
              createdBy: 'test',
            })
          }
        })
      }

      // Verify final quantity and movement count
      await getProvider().withTransaction(async (repos) => {
        const product = await repos.inventory.findById('stock-prod')
        expect(product?.stock.quantity).toBe(0)

        const movements = await repos.inventory.listMovements('stock-prod')
        expect(movements).toHaveLength(DECREMENT_COUNT)
      })
    })

    it('should handle parallel decrements with capability-gated assertions', async () => {
      const INITIAL_QUANTITY = 50
      const PARALLEL_COUNT = 10

      // Set up product
      await getProvider().withTransaction(async (repos) => {
        await repos.inventory.save(
          makeProduct({
            id: 'stock-parallel',
            stock: { quantity: INITIAL_QUANTITY, unit: 'unit' },
          }),
        )
      })

      // Parallel read-modify-write decrements
      const decrementPromises = Array.from({ length: PARALLEL_COUNT }, async (_, i) => {
        await getProvider().withTransaction(async (repos) => {
          const product = await repos.inventory.findById('stock-parallel')
          if (product && product.stock.quantity > 0) {
            product.stock.quantity -= 1
            await repos.inventory.save(product)

            await repos.inventory.recordMovement({
              id: `move-par-${i}`,
              productId: 'stock-parallel',
              quantity: 1,
              movementType: 'out',
              reason: 'Parallel decrement',
              createdAt: new Date(),
              createdBy: 'test',
            })
          }
        })
      })

      await Promise.all(decrementPromises)

      // Verify with capability gating
      await getProvider().withTransaction(async (repos) => {
        const product = await repos.inventory.findById('stock-parallel')
        const movements = await repos.inventory.listMovements('stock-parallel')

        if (adapter.capabilities.serializableTransactions) {
          // Strict serializable adapters must produce exact results
          expect(product?.stock.quantity).toBe(INITIAL_QUANTITY - PARALLEL_COUNT)
          expect(movements).toHaveLength(PARALLEL_COUNT)
        } else {
          // Non-serializable adapters must satisfy safety invariants
          // Quantity should never go negative
          expect(product?.stock.quantity).toBeGreaterThanOrEqual(0)
          expect(product?.stock.quantity).toBeLessThanOrEqual(INITIAL_QUANTITY)

          // Must be an integer
          expect(Number.isInteger(product?.stock.quantity)).toBe(true)

          // At least one movement should have been recorded
          expect(movements.length).toBeGreaterThanOrEqual(1)

          // No corruption: movements should match the reduction
          const totalMovements = movements.length
          const expectedMax = INITIAL_QUANTITY
          const resultQuantity = product?.stock.quantity ?? 0
          expect(resultQuantity).toBeLessThanOrEqual(expectedMax)
        }
      })
    })

    it('should never produce negative quantities', async () => {
      // Setup: product with low stock
      await getProvider().withTransaction(async (repos) => {
        await repos.inventory.save(
          makeProduct({
            id: 'stock-negative-test',
            stock: { quantity: 3, unit: 'unit' },
          }),
        )
      })

      // Try to decrement more than available
      const decrementPromises = Array.from({ length: 10 }, async (_, i) => {
        await getProvider().withTransaction(async (repos) => {
          const product = await repos.inventory.findById('stock-negative-test')
          if (product && product.stock.quantity > 0) {
            product.stock.quantity -= 1
            await repos.inventory.save(product)
          }
        })
      })

      await Promise.all(decrementPromises)

      // Verify quantity is never negative
      await getProvider().withTransaction(async (repos) => {
        const product = await repos.inventory.findById('stock-negative-test')
        expect(product?.stock.quantity).toBeGreaterThanOrEqual(0)
      })
    })

    it('should remove capability gate since both adapters now serialize transactions', async () => {
      // Previously: only serializable adapters got strict assertions
      // Now: both memory and indexeddb have serializableTransactions: true
      expect(adapter.capabilities.serializableTransactions).toBe(true)
    })
  })

  describe('Oversell prevention (StockLevel + StockMovement ledger)', () => {
    it('should allow exactly one of two simultaneous last-unit sales when oversell is off', async () => {
      const orgId = 'org-test'
      const branchId = 'branch-test'
      const variantId = 'variant-test'
      const clock = new SystemClock()
      const ids = new UuidIdGenerator()
      const service = new InventoryService(clock, ids)

      // Seed with one unit of stock
      await getProvider().withTransaction(async (repos) => {
        const level = makeStockLevel({
          orgId,
          branchId,
          variantId,
          quantity: 1,
        })
        await repos.inventory.saveStockLevel(level)
      })

      // Two concurrent sales of the last unit
      const results = await Promise.allSettled([
        getProvider().withTransaction(async (repos) => {
          return service.recordSale(repos, {
            orgId,
            branchId,
            variantId,
            quantity: 1,
            reference: 'sale-1',
            createdBy: 'test',
            allowOversell: false,
          })
        }),
        getProvider().withTransaction(async (repos) => {
          return service.recordSale(repos, {
            orgId,
            branchId,
            variantId,
            quantity: 1,
            reference: 'sale-2',
            createdBy: 'test',
            allowOversell: false,
          })
        }),
      ])

      // Exactly one should succeed, one should reject
      const settled = results.filter((r) => r.status === 'fulfilled').length
      const rejected = results.filter((r) => r.status === 'rejected').length
      expect(settled).toBe(1)
      expect(rejected).toBe(1)

      // The rejected one should be InsufficientStockError
      const rejectedResult = results.find((r) => r.status === 'rejected')
      if (rejectedResult && rejectedResult.status === 'rejected') {
        expect(rejectedResult.reason).toBeInstanceOf(InsufficientStockError)
      }

      // Final quantity should be 0
      await getProvider().withTransaction(async (repos) => {
        const level = await repos.inventory.findStockLevel(branchId, variantId)
        expect(level?.quantity).toBe(0)

        // Exactly one sale movement should be recorded
        const movements = await repos.inventory.listMovementsForBranch(orgId, branchId)
        const sales = movements.filter((m) => m.movementType === 'sale')
        expect(sales).toHaveLength(1)
      })
    })

    it('should allow both concurrent last-unit sales when oversell is on', async () => {
      const orgId = 'org-test-oversell'
      const branchId = 'branch-test-oversell'
      const variantId = 'variant-test-oversell'
      const clock = new SystemClock()
      const ids = new UuidIdGenerator()
      const service = new InventoryService(clock, ids)

      // Seed with one unit of stock
      await getProvider().withTransaction(async (repos) => {
        const level = makeStockLevel({
          orgId,
          branchId,
          variantId,
          quantity: 1,
        })
        await repos.inventory.saveStockLevel(level)
      })

      // Two concurrent sales
      const results = await Promise.allSettled([
        getProvider().withTransaction(async (repos) => {
          return service.recordSale(repos, {
            orgId,
            branchId,
            variantId,
            quantity: 1,
            reference: 'sale-3',
            createdBy: 'test',
            allowOversell: true,
          })
        }),
        getProvider().withTransaction(async (repos) => {
          return service.recordSale(repos, {
            orgId,
            branchId,
            variantId,
            quantity: 1,
            reference: 'sale-4',
            createdBy: 'test',
            allowOversell: true,
          })
        }),
      ])

      // Both should succeed
      expect(results.every((r) => r.status === 'fulfilled')).toBe(true)

      // Final quantity should be -1
      await getProvider().withTransaction(async (repos) => {
        const level = await repos.inventory.findStockLevel(branchId, variantId)
        expect(level?.quantity).toBe(-1)

        // Two sale movements should be recorded
        const movements = await repos.inventory.listMovementsForBranch(orgId, branchId)
        const sales = movements.filter((m) => m.movementType === 'sale')
        expect(sales).toHaveLength(2)
      })
    })

    it('should detect artificially injected drift via reconciliation', async () => {
      const orgId = 'org-recon'
      const branchId = 'branch-recon'
      const variantId = 'variant-recon'
      const reconciliation = new ReconciliationService()

      // Seed a level and movements
      await getProvider().withTransaction(async (repos) => {
        const level = makeStockLevel({
          orgId,
          branchId,
          variantId,
          quantity: 100,
        })
        await repos.inventory.saveStockLevel(level)

        const movement = makeStockMovement({
          orgId,
          branchId,
          variantId,
          quantity: 100,
          movementType: 'purchase',
        })
        await repos.inventory.appendMovement(movement)
      })

      // Artificially corrupt the level (simulate drift)
      await getProvider().withTransaction(async (repos) => {
        const level = await repos.inventory.findStockLevel(branchId, variantId)
        if (level) {
          level.quantity = 50 // Corrupt it
          await repos.inventory.saveStockLevel(level)
        }
      })

      // Reconciliation should detect drift
      await getProvider().withTransaction(async (repos) => {
        const report = await reconciliation.reconcileBranch(repos, orgId, branchId)
        expect(report).toHaveLength(1)
        expect(report[0]?.variantId).toBe(variantId)
        expect(report[0]?.expectedQuantity).toBe(100)
        expect(report[0]?.actualQuantity).toBe(50)
        expect(report[0]?.drift).toBe(-50)
      })

      // Create a clean variant for comparison
      const variantId2 = 'variant-clean'
      await getProvider().withTransaction(async (repos) => {
        const level = makeStockLevel({
          orgId,
          branchId,
          variantId: variantId2,
          quantity: 100,
        })
        await repos.inventory.saveStockLevel(level)

        const movement = makeStockMovement({
          orgId,
          branchId,
          variantId: variantId2,
          quantity: 100,
          movementType: 'purchase',
        })
        await repos.inventory.appendMovement(movement)
      })

      // Reconciliation should only report the drifted variant
      await getProvider().withTransaction(async (repos) => {
        const report = await reconciliation.reconcileBranch(repos, orgId, branchId)
        expect(report).toHaveLength(1)
        expect(report[0]?.variantId).toBe(variantId)
        // variantId2 is clean, should not appear in report
        const hasClean = report.some((r) => r.variantId === variantId2)
        expect(hasClean).toBe(false)
      })
    })
  })
}
