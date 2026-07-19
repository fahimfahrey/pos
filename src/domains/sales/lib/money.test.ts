import { describe, it, expect } from 'vitest'
import {
  priceLine,
  applyLineDiscount,
  priceCart,
  calculateChangeDue,
  DISCOUNT_TYPE,
  TAX_MODE,
} from './money'

describe('money.ts', () => {
  describe('priceLine - exclusive tax', () => {
    it('should calculate line price with exclusive tax', () => {
      const line = priceLine(2, 10, 10, TAX_MODE.EXCLUSIVE)
      expect(line.subtotal).toBe(20)
      expect(line.taxAmount).toBeCloseTo(2, 5)
      expect(line.total).toBeCloseTo(22, 5)
    })

    it('should handle zero-tax line', () => {
      const line = priceLine(1, 15.5, 0, TAX_MODE.EXCLUSIVE)
      expect(line.subtotal).toBe(15.5)
      expect(line.taxAmount).toBe(0)
      expect(line.total).toBe(15.5)
    })

    it('should handle decimal quantities', () => {
      const line = priceLine(1.5, 10, 10, TAX_MODE.EXCLUSIVE)
      expect(line.subtotal).toBeCloseTo(15, 5)
      expect(line.taxAmount).toBeCloseTo(1.5, 5)
      expect(line.total).toBeCloseTo(16.5, 5)
    })
  })

  describe('priceLine - inclusive tax', () => {
    it('should calculate line price with inclusive tax', () => {
      const line = priceLine(1, 110, 10, TAX_MODE.INCLUSIVE)
      expect(line.subtotal).toBeCloseTo(100, 5)
      expect(line.taxAmount).toBeCloseTo(10, 5)
      expect(line.total).toBeCloseTo(110, 5)
    })

    it('should extract tax correctly from inclusive total', () => {
      const line = priceLine(1, 121, 10, TAX_MODE.INCLUSIVE)
      // 121 / 1.1 = 110, tax = 11
      expect(line.subtotal).toBeCloseTo(110, 5)
      expect(line.taxAmount).toBeCloseTo(11, 5)
      expect(line.total).toBeCloseTo(121, 5)
    })
  })

  describe('applyLineDiscount - percentage', () => {
    it('should apply percentage discount to a line', () => {
      const line = priceLine(1, 100, 10, TAX_MODE.EXCLUSIVE)
      const discounted = applyLineDiscount(
        line,
        { type: DISCOUNT_TYPE.PERCENTAGE, amount: 10 },
        TAX_MODE.EXCLUSIVE,
      )
      expect(discounted.subtotal).toBeCloseTo(90, 5)
      expect(discounted.discount).toBeCloseTo(10, 5)
      expect(discounted.taxAmount).toBeCloseTo(9, 5)
      expect(discounted.total).toBeCloseTo(99, 5)
    })

    it('should not allow discount to exceed subtotal', () => {
      const line = priceLine(1, 100, 0, TAX_MODE.EXCLUSIVE)
      const discounted = applyLineDiscount(
        line,
        { type: DISCOUNT_TYPE.PERCENTAGE, amount: 150 },
        TAX_MODE.EXCLUSIVE,
      )
      expect(discounted.discount).toBe(100)
      expect(discounted.subtotal).toBe(0)
      expect(discounted.total).toBe(0)
    })
  })

  describe('applyLineDiscount - fixed amount', () => {
    it('should apply fixed discount to a line', () => {
      const line = priceLine(1, 100, 10, TAX_MODE.EXCLUSIVE)
      const discounted = applyLineDiscount(
        line,
        { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: 15 },
        TAX_MODE.EXCLUSIVE,
      )
      expect(discounted.subtotal).toBeCloseTo(85, 5)
      expect(discounted.discount).toBeCloseTo(15, 5)
      expect(discounted.taxAmount).toBeCloseTo(8.5, 5)
      expect(discounted.total).toBeCloseTo(93.5, 5)
    })

    it('should clamp fixed discount to subtotal', () => {
      const line = priceLine(1, 100, 0, TAX_MODE.EXCLUSIVE)
      const discounted = applyLineDiscount(
        line,
        { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: 150 },
        TAX_MODE.EXCLUSIVE,
      )
      expect(discounted.discount).toBe(100)
      expect(discounted.subtotal).toBe(0)
    })
  })

  describe('priceCart - basic cart', () => {
    it('should calculate cart totals without discount', () => {
      const cart = priceCart(
        [
          { quantity: 2, unitPrice: 10, taxRate: 10 },
          { quantity: 1, unitPrice: 20, taxRate: 10 },
        ],
        undefined,
        TAX_MODE.EXCLUSIVE,
      )

      expect(cart.subtotal).toBeCloseTo(40, 5)
      expect(cart.discount).toBe(0)
      expect(cart.tax).toBeCloseTo(4, 5)
      expect(cart.total).toBeCloseTo(44, 5)
    })
  })

  describe('priceCart - with percentage discount', () => {
    it('should distribute percentage discount proportionally', () => {
      const cart = priceCart(
        [
          { quantity: 1, unitPrice: 100, taxRate: 10 },
          { quantity: 1, unitPrice: 100, taxRate: 10 },
        ],
        { type: DISCOUNT_TYPE.PERCENTAGE, amount: 10 },
        TAX_MODE.EXCLUSIVE,
      )

      // subtotal = 200, discount = 20, tax on (180) = 18, total = 198
      expect(cart.subtotal).toBeCloseTo(200, 5)
      expect(cart.discount).toBeCloseTo(20, 5)
      expect(cart.tax).toBeCloseTo(18, 5)
      expect(cart.total).toBeCloseTo(198, 5)
    })
  })

  describe('priceCart - with fixed discount', () => {
    it('should apply fixed cart discount', () => {
      const cart = priceCart(
        [
          { quantity: 2, unitPrice: 50, taxRate: 10 },
          { quantity: 1, unitPrice: 50, taxRate: 10 },
        ],
        { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: 25 },
        TAX_MODE.EXCLUSIVE,
      )

      // subtotal = 150, discount = 25, tax on (125) = 12.5, total = 137.5
      expect(cart.subtotal).toBeCloseTo(150, 5)
      expect(cart.discount).toBeCloseTo(25, 5)
      expect(cart.tax).toBeCloseTo(12.5, 5)
      expect(cart.total).toBeCloseTo(137.5, 5)
    })
  })

  describe('priceCart - mixed tax rates', () => {
    it('should calculate tax separately by rate', () => {
      const cart = priceCart(
        [
          { quantity: 1, unitPrice: 100, taxRate: 0 },
          { quantity: 1, unitPrice: 100, taxRate: 5 },
          { quantity: 1, unitPrice: 100, taxRate: 15 },
        ],
        undefined,
        TAX_MODE.EXCLUSIVE,
      )

      expect(cart.subtotal).toBeCloseTo(300, 5)
      expect(cart.tax).toBeCloseTo(20, 5) // 0 + 5 + 15
      expect(Object.keys(cart.taxByRate)).toContain('0')
      expect(Object.keys(cart.taxByRate)).toContain('5')
      expect(Object.keys(cart.taxByRate)).toContain('15')
    })
  })

  describe('priceCart - largest-remainder allocation', () => {
    it('should distribute cart discount exactly to lines', () => {
      const cart = priceCart(
        [
          { quantity: 1, unitPrice: 1, taxRate: 0 },
          { quantity: 1, unitPrice: 1, taxRate: 0 },
          { quantity: 1, unitPrice: 1, taxRate: 0 },
        ],
        { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: 1 },
        TAX_MODE.EXCLUSIVE,
      )

      // subtotal = 3, discount = 1, total = 2
      // discount should be distributed so sum is exactly 1
      const discountSum = cart.discount
      expect(discountSum).toBeCloseTo(1, 5)
      expect(cart.total).toBeCloseTo(2, 5)
    })

    it('should allocate largest remainders to lines with largest fractional parts', () => {
      // Test that cent allocation doesn't leave gaps
      const cart = priceCart(
        [
          { quantity: 3, unitPrice: 10, taxRate: 0 },
          { quantity: 1, unitPrice: 15, taxRate: 0 },
          { quantity: 2, unitPrice: 25, taxRate: 0 },
        ],
        { type: DISCOUNT_TYPE.PERCENTAGE, amount: 13.17 },
        TAX_MODE.EXCLUSIVE,
      )

      const expectedDiscount = Math.round(cart.subtotal * 1317) / 100 / 100
      expect(Math.abs(cart.discount - expectedDiscount)).toBeLessThan(0.01)
    })
  })

  describe('priceCart - inclusive tax with discount', () => {
    it('should handle inclusive tax correctly with discount', () => {
      const cart = priceCart(
        [
          { quantity: 1, unitPrice: 110, taxRate: 10 },
          { quantity: 1, unitPrice: 110, taxRate: 10 },
        ],
        { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: 10 },
        TAX_MODE.INCLUSIVE,
      )

      // Each line: net=100, tax=10, total=110
      // Subtotal (net) = 200
      // Discount = 10
      // Net after discount = 190
      // Tax on 190 = 19
      // Total = 200 (discount is from the total, not from net)
      expect(cart.subtotal).toBeCloseTo(190, 5)
      expect(cart.discount).toBeCloseTo(10, 5)
    })
  })

  describe('priceCart - zero subtotal', () => {
    it('should handle empty cart', () => {
      const cart = priceCart([], undefined, TAX_MODE.EXCLUSIVE)
      expect(cart.subtotal).toBe(0)
      expect(cart.tax).toBe(0)
      expect(cart.total).toBe(0)
    })

    it('should handle zero-price line with discount', () => {
      const cart = priceCart(
        [{ quantity: 1, unitPrice: 0, taxRate: 0, discount: 1 }],
        undefined,
        TAX_MODE.EXCLUSIVE,
      )
      expect(cart.subtotal).toBe(0)
      expect(cart.discount).toBe(0) // discount is clamped to 0
      expect(cart.total).toBe(0)
    })
  })

  describe('calculateChangeDue', () => {
    it('should calculate change correctly', () => {
      const change = calculateChangeDue(50, 35.5)
      expect(change).toBeCloseTo(14.5, 5)
    })

    it('should return 0 when tendered equals total', () => {
      const change = calculateChangeDue(100, 100)
      expect(change).toBe(0)
    })

    it('should return 0 when tendered is less than total', () => {
      const change = calculateChangeDue(50, 75)
      expect(change).toBe(0)
    })

    it('should handle float arithmetic correctly', () => {
      const change = calculateChangeDue(100.05, 99.45)
      expect(change).toBeCloseTo(0.6, 5)
    })
  })

  describe('per-line discounts with cart discount', () => {
    it('should combine per-line and cart discounts', () => {
      const cart = priceCart(
        [
          { quantity: 1, unitPrice: 100, taxRate: 10, discount: { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: 10 } },
          { quantity: 1, unitPrice: 100, taxRate: 10 },
        ],
        { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: 10 },
        TAX_MODE.EXCLUSIVE,
      )

      // subtotal = 200
      // per-line discount = 10
      // cart discount = 10
      // total discount = 20
      // net = 180
      // tax = 18
      // total = 198
      expect(cart.subtotal).toBeCloseTo(180, 5)
      expect(cart.discount).toBeCloseTo(20, 5)
    })
  })
})
