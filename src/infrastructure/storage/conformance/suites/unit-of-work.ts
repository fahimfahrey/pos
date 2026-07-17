import { describe, it, expect } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import { makeProduct, makeOrder, makeAuditEntry } from '../fixtures'

export function runUnitOfWorkSuite(getProvider: () => StorageProvider): void {
  describe('UnitOfWork atomicity (multi-repository rollback)', () => {
    it('should roll back all writes on mid-transaction error', async () => {
      // Create initial data
      await getProvider().withTransaction(async (repos) => {
        await repos.inventory.save(makeProduct({ id: 'prod-1' }))
        await repos.sales.save(makeOrder({ id: 'order-1' }))
      })

      // Attempt a multi-repo transaction that fails mid-way
      await expect(
        getProvider().withTransaction(async (repos) => {
          // Update product
          const product = await repos.inventory.findById('prod-1')
          if (product) {
            product.stock.quantity = 0
            await repos.inventory.save(product)
          }

          // Update order
          const order = await repos.sales.findById('order-1')
          if (order) {
            order.status = 'paid'
            await repos.sales.save(order)
          }

          // Record audit
          await repos.audit.append(makeAuditEntry({ id: 'audit-1' }))

          // Simulate mid-transaction error
          throw new Error('Simulated transaction error')
        }),
      ).rejects.toThrow('Simulated transaction error')

      // Verify rollback: all collections should be unchanged
      await getProvider().withTransaction(async (repos) => {
        const product = await repos.inventory.findById('prod-1')
        expect(product?.stock.quantity).toBe(100) // Original value

        const order = await repos.sales.findById('order-1')
        expect(order?.status).toBe('open') // Original value

        const audit = await repos.audit.findById('audit-1')
        expect(audit).toBeNull() // Never inserted
      })
    })

    it('should roll back writes even after awaits and interleaving', async () => {
      // Set up initial state
      await getProvider().withTransaction(async (repos) => {
        await repos.inventory.save(makeProduct({ id: 'prod-2' }))
        await repos.customers.save({
          id: 'cust-2',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      })

      // Attempt a transaction with awaits before error
      await expect(
        getProvider().withTransaction(async (repos) => {
          const product = await repos.inventory.findById('prod-2')
          if (product) {
            product.name = 'Updated Product'
            await repos.inventory.save(product)
          }

          // Await a resolved promise (simulate interleaved async work)
          await Promise.resolve()

          const customer = await repos.customers.findById('cust-2')
          if (customer) {
            customer.firstName = 'Updated'
            await repos.customers.save(customer)
          }

          // Another await
          await Promise.resolve()

          // Then fail
          throw new Error('Post-await error')
        }),
      ).rejects.toThrow('Post-await error')

      // Verify rollback
      await getProvider().withTransaction(async (repos) => {
        const product = await repos.inventory.findById('prod-2')
        expect(product?.name).toBe('Test Product')

        const customer = await repos.customers.findById('cust-2')
        expect(customer?.firstName).toBe('Test')
      })
    })

    it('should preserve atomicity with multiple reads and writes', async () => {
      // Setup: create three interdependent records
      await getProvider().withTransaction(async (repos) => {
        await repos.inventory.save(
          makeProduct({ id: 'prod-3', name: 'Original Product', stock: { quantity: 100, unit: 'unit' } }),
        )
        await repos.sales.save(makeOrder({ id: 'order-3', status: 'open' }))
        await repos.audit.append(makeAuditEntry({ id: 'audit-3' }))
      })

      // Complex transaction that should fully rollback
      await expect(
        getProvider().withTransaction(async (repos) => {
          // Read product and reduce stock
          const product = await repos.inventory.findById('prod-3')
          if (product) {
            product.stock.quantity = 50
            await repos.inventory.save(product)
          }

          // Read order and mark as paid
          const order = await repos.sales.findById('order-3')
          if (order) {
            order.status = 'paid'
            await repos.sales.save(order)
          }

          // Create new audit entry
          await repos.audit.append(makeAuditEntry({ id: 'audit-3b' }))

          // Read and verify new data
          const updatedProduct = await repos.inventory.findById('prod-3')
          expect(updatedProduct?.stock.quantity).toBe(50)

          // Now fail
          throw new Error('Complex rollback test')
        }),
      ).rejects.toThrow('Complex rollback test')

      // Everything should be back to original state
      await getProvider().withTransaction(async (repos) => {
        const product = await repos.inventory.findById('prod-3')
        expect(product?.stock.quantity).toBe(100)
        expect(product?.name).toBe('Original Product')

        const order = await repos.sales.findById('order-3')
        expect(order?.status).toBe('open')

        const audit1 = await repos.audit.findById('audit-3')
        expect(audit1).not.toBeNull()

        const audit2 = await repos.audit.findById('audit-3b')
        expect(audit2).toBeNull()
      })
    })

    // TODO: Once unitOfWork() is fully implemented with real transaction support,
    // add explicit begin/commit/rollback tests here.
  })
}
