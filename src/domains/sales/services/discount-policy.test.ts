import { describe, it, expect } from 'vitest'
import { DiscountPolicyService, type DiscountPolicyInput } from './discount-policy'
import { DISCOUNT_TYPE } from '@constants/enums/discount-type'
import { ForbiddenError } from '@shared/errors'

describe('discount-policy', () => {
  const service = new DiscountPolicyService()
  const limits = { cashierMaxPercent: 10, cashierMaxFixedAmount: 20 }

  describe('isWithinCashierLimit - percentage', () => {
    it('should allow percentage discount within limit', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.PERCENTAGE,
        amount: 5,
        lineOrCartSubtotal: 100,
      }

      expect(service.isWithinCashierLimit(input, limits)).toBe(true)
    })

    it('should allow percentage discount at limit', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.PERCENTAGE,
        amount: 10,
        lineOrCartSubtotal: 100,
      }

      expect(service.isWithinCashierLimit(input, limits)).toBe(true)
    })

    it('should reject percentage discount exceeding limit', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.PERCENTAGE,
        amount: 15,
        lineOrCartSubtotal: 100,
      }

      expect(service.isWithinCashierLimit(input, limits)).toBe(false)
    })
  })

  describe('isWithinCashierLimit - fixed amount', () => {
    it('should allow fixed discount within limit', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.FIXED_AMOUNT,
        amount: 10,
        lineOrCartSubtotal: 100,
      }

      expect(service.isWithinCashierLimit(input, limits)).toBe(true)
    })

    it('should allow fixed discount at limit', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.FIXED_AMOUNT,
        amount: 20,
        lineOrCartSubtotal: 100,
      }

      expect(service.isWithinCashierLimit(input, limits)).toBe(true)
    })

    it('should reject fixed discount exceeding limit', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.FIXED_AMOUNT,
        amount: 25,
        lineOrCartSubtotal: 100,
      }

      expect(service.isWithinCashierLimit(input, limits)).toBe(false)
    })
  })

  describe('validateDiscount', () => {
    it('should allow discount with valid manager override token', () => {
      const futureDate = new Date(Date.now() + 120000) // 2 min in future
      const override = { approvedBy: 'manager1', expiresAt: futureDate }

      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.PERCENTAGE,
        amount: 15,
        lineOrCartSubtotal: 100,
      }

      expect(() => service.validateDiscount(input, limits, override)).not.toThrow()
    })

    it('should reject discount with expired override token', () => {
      const pastDate = new Date(Date.now() - 1000) // 1 sec in past
      const override = { approvedBy: 'manager1', expiresAt: pastDate }

      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.PERCENTAGE,
        amount: 15,
        lineOrCartSubtotal: 100,
      }

      expect(() => service.validateDiscount(input, limits, override)).toThrow(ForbiddenError)
    })

    it('should throw error for over-limit percentage without override', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.PERCENTAGE,
        amount: 15,
        lineOrCartSubtotal: 100,
      }

      expect(() => service.validateDiscount(input, limits)).toThrow(ForbiddenError)
    })

    it('should throw error for over-limit fixed amount without override', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.FIXED_AMOUNT,
        amount: 25,
        lineOrCartSubtotal: 100,
      }

      expect(() => service.validateDiscount(input, limits)).toThrow(ForbiddenError)
    })

    it('should allow in-limit discount without override', () => {
      const input: DiscountPolicyInput = {
        type: DISCOUNT_TYPE.PERCENTAGE,
        amount: 5,
        lineOrCartSubtotal: 100,
      }

      expect(() => service.validateDiscount(input, limits)).not.toThrow()
    })
  })
})
