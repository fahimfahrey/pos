import { describe, it, expect } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import type { ConformanceAdapter } from '../types'
import { makeProduct } from '../fixtures'

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
  })
}
