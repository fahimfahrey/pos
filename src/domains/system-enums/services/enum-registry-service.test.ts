import { describe, it, expect } from 'vitest'
import { EnumRegistryService } from './enum-registry-service'
import { ConflictError } from '@shared/errors'
import type { SystemEnumValueRepository } from '../repository'
import type { SystemEnumValue } from '../entities/system-enum-value'
import { ENUM_REGISTRY_KEY } from '@constants/enums'

describe('EnumRegistryService', () => {
  let service: EnumRegistryService
  let mockRepo: SystemEnumValueRepository
  let storedValues: SystemEnumValue[] = []

  beforeEach(() => {
    storedValues = []

    mockRepo = {
      save: async (value: SystemEnumValue) => {
        storedValues.push(value)
      },
      findById: async (id: string) => {
        return storedValues.find((v) => v.id === id) ?? null
      },
      listForOrg: async (orgId: string) => {
        return storedValues.filter((v) => v.orgId === orgId)
      },
      listForOrgAndKey: async (orgId: string, registryKey) => {
        return storedValues.filter((v) => v.orgId === orgId && v.registryKey === registryKey)
      },
      delete: async (id: string) => {
        storedValues = storedValues.filter((v) => v.id !== id)
      },
    }

    service = new EnumRegistryService(mockRepo)
  })

  describe('resolveValues', () => {
    it('should return only static values when no runtime rows exist', async () => {
      const values = await service.resolveValues('org-1', ENUM_REGISTRY_KEY.PAYMENT_METHOD)
      expect(values).toContain('cash')
      expect(values).toContain('card')
      expect(values).toContain('check')
      expect(values).toContain('other')
    })

    it('should merge static and active runtime values', async () => {
      await service.addValue({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'bkash',
        label: 'bKash',
        createdBy: 'user-1',
        now: new Date(),
      })

      const values = await service.resolveValues('org-1', ENUM_REGISTRY_KEY.PAYMENT_METHOD)
      expect(values).toContain('cash')
      expect(values).toContain('bkash')
    })

    it('should exclude inactive runtime values', async () => {
      await mockRepo.save({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'inactive-method',
        label: 'Inactive Method',
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      })

      const values = await service.resolveValues('org-1', ENUM_REGISTRY_KEY.PAYMENT_METHOD)
      expect(values).not.toContain('inactive-method')
      expect(values).toContain('cash')
    })

    it('should deduplicate values', async () => {
      await service.addValue({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'unique-value',
        label: 'Unique',
        createdBy: 'user-1',
        now: new Date(),
      })

      const values = await service.resolveValues('org-1', ENUM_REGISTRY_KEY.PAYMENT_METHOD)
      const uniqueCount = values.filter((v) => v === 'unique-value').length
      expect(uniqueCount).toBe(1)
    })
  })

  describe('schemaFor', () => {
    it('should build a Zod enum from static values', async () => {
      const schema = await service.schemaFor('org-1', ENUM_REGISTRY_KEY.PAYMENT_METHOD)

      expect(schema.parse('cash')).toBe('cash')
      expect(schema.parse('card')).toBe('card')

      expect(() => schema.parse('invalid-method')).toThrow()
    })

    it('should build a Zod enum from merged static and runtime values', async () => {
      await service.addValue({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'bkash',
        label: 'bKash',
        createdBy: 'user-1',
        now: new Date(),
      })

      const schema = await service.schemaFor('org-1', ENUM_REGISTRY_KEY.PAYMENT_METHOD)

      expect(schema.parse('cash')).toBe('cash')
      expect(schema.parse('bkash')).toBe('bkash')
      expect(() => schema.parse('paypal')).toThrow()
    })

    it('should accept different registryKey values independently', async () => {
      const paymentSchema = await service.schemaFor('org-1', ENUM_REGISTRY_KEY.PAYMENT_METHOD)
      const statusSchema = await service.schemaFor('org-1', ENUM_REGISTRY_KEY.SALE_STATUS)

      expect(paymentSchema.parse('cash')).toBe('cash')
      expect(() => statusSchema.parse('cash')).toThrow() // 'cash' not in sale statuses
    })
  })

  describe('addValue', () => {
    it('should successfully add a new runtime value', async () => {
      const result = await service.addValue({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'girocard',
        label: 'Girocard',
        createdBy: 'user-1',
        now: new Date('2024-01-15'),
      })

      expect(result.id).toBe('enum-1')
      expect(result.value).toBe('girocard')
      expect(result.active).toBe(true)
      expect(result.createdAt).toEqual(new Date('2024-01-15'))
    })

    it('should reject a duplicate of a static value', async () => {
      const promise = service.addValue({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'cash', // Already in STATIC_ENUM_VALUES
        label: 'Cash',
        createdBy: 'user-1',
        now: new Date(),
      })

      await expect(promise).rejects.toThrow(ConflictError)
      await expect(promise).rejects.toThrow('"cash" is already a static paymentMethod value')
    })

    it('should reject a duplicate of an existing runtime value for the same org and key', async () => {
      await service.addValue({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'bkash',
        label: 'bKash',
        createdBy: 'user-1',
        now: new Date(),
      })

      const promise = service.addValue({
        id: 'enum-2',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'bkash',
        label: 'bKash Duplicate',
        createdBy: 'user-1',
        now: new Date(),
      })

      await expect(promise).rejects.toThrow(ConflictError)
      await expect(promise).rejects.toThrow('"bkash" already exists for this organization')
    })

    it('should allow the same value under different registryKeys', async () => {
      await service.addValue({
        id: 'enum-1',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'test',
        label: 'Test Payment',
        createdBy: 'user-1',
        now: new Date(),
      })

      const promise = service.addValue({
        id: 'enum-2',
        orgId: 'org-1',
        registryKey: ENUM_REGISTRY_KEY.DISCOUNT_TYPE, // Different key
        value: 'test',
        label: 'Test Discount',
        createdBy: 'user-1',
        now: new Date(),
      })

      await expect(promise).resolves.toBeDefined()
    })

    it('should allow the same value for different orgs', async () => {
      await service.addValue({
        id: 'enum-1',
        orgId: 'org-dhaka',
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'bkash',
        label: 'bKash',
        createdBy: 'user-1',
        now: new Date(),
      })

      const promise = service.addValue({
        id: 'enum-2',
        orgId: 'org-berlin', // Different org
        registryKey: ENUM_REGISTRY_KEY.PAYMENT_METHOD,
        value: 'bkash',
        label: 'bKash',
        createdBy: 'user-1',
        now: new Date(),
      })

      await expect(promise).resolves.toBeDefined()
    })
  })
})
