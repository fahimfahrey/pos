import { describe, it, expect } from 'vitest'
import { createStorageProvider } from '@infra/storage'
import { makeOrder, makeSystemEnumValue } from '@infra/storage/conformance'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { SystemClock } from '@infra/adapters/system-clock'
import { EnumRegistryService } from '@domains/system-enums/services/enum-registry-service'
import { ENUM_REGISTRY_KEY, ORDER_STATUS } from '@constants/enums'
import { completeSaleWithProvider, type CompleteSaleInput } from './complete-sale'

describe('completeSale action', () => {
  const idGen = new UuidIdGenerator()
  const clock = new SystemClock()

  it('should accept a runtime payment method and complete the sale', async () => {
    const provider = createStorageProvider({ engine: 'memory' })
    const orgId = 'org-dhaka'

    try {
      await provider.withTransaction(async (repos) => {
        // Setup: save an order
        const order = makeOrder({ id: 'order-1', orgId, status: 'open' })
        await repos.sales.save(order)

        // Setup: add a runtime payment method
        const enumValue = makeSystemEnumValue({
          id: 'enum-1',
          orgId,
          registryKey: 'paymentMethod',
          value: 'bkash',
          label: 'bKash',
          active: true,
        })
        await repos.systemEnums.save(enumValue)
      })

      // Act: complete the sale with the runtime payment method
      const input: CompleteSaleInput = {
        orderId: 'order-1',
        orgId,
        method: 'bkash',
        amount: 199.98,
        currency: 'USD',
      }

      const result = await completeSaleWithProvider(input, provider, 'user-1')

      // Assert
      expect(result.ok).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.order.status).toBe(ORDER_STATUS.PAID)
      expect(result.data!.order.paymentMethod).toBe('bkash')
      expect(result.data!.payment.method).toBe('bkash')
      expect(result.data!.payment.status).toBe('completed')
      expect(result.data!.payment.amount).toBe(199.98)

      // Verify persistence
      await provider.withTransaction(async (repos) => {
        const savedOrder = await repos.sales.findById('order-1')
        const savedPayment = await repos.payments.findPaymentById(result.data!.payment.id)

        expect(savedOrder).toBeDefined()
        expect(savedOrder!.status).toBe(ORDER_STATUS.PAID)
        expect(savedOrder!.paymentMethod).toBe('bkash')
        expect(savedPayment).toBeDefined()
        expect(savedPayment!.method).toBe('bkash')
      })
    } finally {
      await provider.close()
    }
  })

  it('should still accept a static payment method', async () => {
    const provider = createStorageProvider({ engine: 'memory' })
    const orgId = 'org-berlin'

    try {
      await provider.withTransaction(async (repos) => {
        const order = makeOrder({ id: 'order-2', orgId, status: 'open' })
        await repos.sales.save(order)
      })

      const input: CompleteSaleInput = {
        orderId: 'order-2',
        orgId,
        method: 'cash',
        amount: 199.98,
        currency: 'USD',
      }

      const result = await completeSaleWithProvider(input, provider, 'user-1')

      expect(result.ok).toBe(true)
      expect(result.data!.order.paymentMethod).toBe('cash')
      expect(result.data!.payment.method).toBe('cash')
    } finally {
      await provider.close()
    }
  })

  it('should reject a payment method not in static or runtime set', async () => {
    const provider = createStorageProvider({ engine: 'memory' })
    const orgId = 'org-test'

    try {
      await provider.withTransaction(async (repos) => {
        const order = makeOrder({ id: 'order-3', orgId, status: 'open' })
        await repos.sales.save(order)
      })

      const input: CompleteSaleInput = {
        orderId: 'order-3',
        orgId,
        method: 'paypal', // Not in static set and not added as runtime value
        amount: 199.98,
        currency: 'USD',
      }

      const result = await completeSaleWithProvider(input, provider, 'user-1')

      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()

      // Verify order was not updated
      await provider.withTransaction(async (repos) => {
        const savedOrder = await repos.sales.findById('order-3')
        expect(savedOrder!.status).toBe('open')
        expect(savedOrder!.paymentMethod).toBeUndefined()
      })
    } finally {
      await provider.close()
    }
  })

  it('should reject a runtime value scoped to a different org', async () => {
    const provider = createStorageProvider({ engine: 'memory' })

    try {
      await provider.withTransaction(async (repos) => {
        // Setup: add bkash for org-dhaka
        const enumValue = makeSystemEnumValue({
          id: 'enum-1',
          orgId: 'org-dhaka',
          registryKey: 'paymentMethod',
          value: 'bkash',
          label: 'bKash',
          active: true,
        })
        await repos.systemEnums.save(enumValue)

        // Setup: order for org-berlin
        const order = makeOrder({ id: 'order-4', orgId: 'org-berlin', status: 'open' })
        await repos.sales.save(order)
      })

      // Attempt: use bkash (from org-dhaka) in org-berlin
      const input: CompleteSaleInput = {
        orderId: 'order-4',
        orgId: 'org-berlin',
        method: 'bkash',
        amount: 199.98,
        currency: 'USD',
      }

      const result = await completeSaleWithProvider(input, provider, 'user-1')

      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()
    } finally {
      await provider.close()
    }
  })

  it('should roll back on payment save failure', async () => {
    const provider = createStorageProvider({ engine: 'memory' })
    const orgId = 'org-test'

    try {
      await provider.withTransaction(async (repos) => {
        const order = makeOrder({ id: 'order-5', orgId, status: 'open' })
        await repos.sales.save(order)
      })

      const input: CompleteSaleInput = {
        orderId: 'order-5',
        orgId,
        method: 'cash',
        amount: -1, // Invalid: negative amount
        currency: 'USD',
      }

      const result = await completeSaleWithProvider(input, provider, 'user-1')

      expect(result.ok).toBe(false)

      // Verify order was not updated
      await provider.withTransaction(async (repos) => {
        const savedOrder = await repos.sales.findById('order-5')
        expect(savedOrder!.status).toBe('open')
      })
    } finally {
      await provider.close()
    }
  })
})
