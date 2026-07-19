// Pure money calculation library for POS.
// All arithmetic is done in integer minor units (cents) to avoid float drift.
// Assumes 2-decimal currency (USD-like); 0-decimal or 3-decimal currencies need adaptation.

import type { DiscountType } from '@constants/enums/discount-type'
import { DISCOUNT_TYPE } from '@constants/enums/discount-type'
import type { TaxMode } from '@constants/enums/tax-mode'
import { TAX_MODE } from '@constants/enums/tax-mode'

export type RoundingRule = 'nearest' | 'up' | 'down'

const MINOR_UNIT_FACTOR = 100 // cents

interface MinorUnitAmount {
  cents: number
}

function toMinorUnits(major: number): number {
  return Math.round(major * MINOR_UNIT_FACTOR)
}

function fromMinorUnits(cents: number): number {
  return Math.round(cents) / MINOR_UNIT_FACTOR
}

function applyRounding(cents: number, rule: RoundingRule, increment: number = 1): number {
  const factor = MINOR_UNIT_FACTOR / increment
  const rounded = cents / factor

  switch (rule) {
    case 'nearest':
      return Math.round(rounded) * factor
    case 'up':
      return Math.ceil(rounded) * factor
    case 'down':
      return Math.floor(rounded) * factor
  }
}

export interface DiscountSpec {
  type: DiscountType
  amount: number
}

export interface LineItem {
  quantity: number
  unitPrice: number
  taxRate: number
}

export interface CartLine extends LineItem {
  discount?: DiscountSpec
}

export interface PricedLine {
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
}

export interface CartTotal {
  subtotal: number
  discount: number
  discountByTaxRate: Record<string, number>
  taxByRate: Record<string, number>
  tax: number
  total: number
}

// Calculate a single line without discount
export function priceLine(
  quantity: number,
  unitPrice: number,
  taxRate: number,
  taxMode: TaxMode,
  roundingRule: RoundingRule = 'nearest',
): PricedLine {
  const quantityCents = toMinorUnits(quantity * MINOR_UNIT_FACTOR)
  const unitPriceCents = toMinorUnits(unitPrice)
  const taxRatePercent = taxRate

  const subtotalCents = Math.round((quantityCents * unitPriceCents) / MINOR_UNIT_FACTOR)

  if (taxMode === TAX_MODE.EXCLUSIVE) {
    const taxCents = applyRounding(
      Math.round((subtotalCents * taxRatePercent) / 10000),
      roundingRule,
    )
    const totalCents = subtotalCents + taxCents

    return {
      quantity,
      unitPrice,
      subtotal: fromMinorUnits(subtotalCents),
      discount: 0,
      taxRate,
      taxAmount: fromMinorUnits(taxCents),
      total: fromMinorUnits(totalCents),
    }
  } else {
    // INCLUSIVE: extract tax from the total
    const netCents = applyRounding(
      Math.round((subtotalCents * 10000) / (10000 + Math.round(taxRatePercent * 100))),
      roundingRule,
    )
    const taxCents = subtotalCents - netCents

    return {
      quantity,
      unitPrice,
      subtotal: fromMinorUnits(netCents),
      discount: 0,
      taxRate,
      taxAmount: fromMinorUnits(taxCents),
      total: fromMinorUnits(subtotalCents),
    }
  }
}

// Apply a discount to a line
export function applyLineDiscount(
  line: PricedLine,
  discount: DiscountSpec,
  taxMode: TaxMode,
  roundingRule: RoundingRule = 'nearest',
): PricedLine {
  const subtotalCents = toMinorUnits(line.subtotal)
  let discountCents = 0

  if (discount.type === DISCOUNT_TYPE.PERCENTAGE) {
    discountCents = applyRounding(
      Math.round((subtotalCents * discount.amount) / 10000),
      roundingRule,
    )
  } else {
    discountCents = toMinorUnits(discount.amount)
  }

  // Clamp discount to subtotal
  discountCents = Math.min(discountCents, subtotalCents)
  discountCents = Math.max(discountCents, 0)

  const discountedSubtotalCents = subtotalCents - discountCents

  if (taxMode === TAX_MODE.EXCLUSIVE) {
    const taxCents = applyRounding(
      Math.round((discountedSubtotalCents * line.taxRate) / 10000),
      roundingRule,
    )
    const totalCents = discountedSubtotalCents + taxCents

    return {
      ...line,
      subtotal: fromMinorUnits(discountedSubtotalCents),
      discount: fromMinorUnits(discountCents),
      taxAmount: fromMinorUnits(taxCents),
      total: fromMinorUnits(totalCents),
    }
  } else {
    // INCLUSIVE
    const netCents = applyRounding(
      Math.round((discountedSubtotalCents * 10000) / (10000 + Math.round(line.taxRate * 100))),
      roundingRule,
    )
    const taxCents = discountedSubtotalCents - netCents

    return {
      ...line,
      subtotal: fromMinorUnits(netCents),
      discount: fromMinorUnits(discountCents),
      taxAmount: fromMinorUnits(taxCents),
      total: fromMinorUnits(discountedSubtotalCents),
    }
  }
}

// Calculate cart totals with proportional cart-level discount allocation
export function priceCart(
  lines: CartLine[],
  cartDiscount: DiscountSpec | undefined,
  taxMode: TaxMode,
  roundingRule: RoundingRule = 'nearest',
): CartTotal {
  // Price all lines without cart discount first
  const pricedLines = lines.map((line) =>
    priceLine(line.quantity, line.unitPrice, line.taxRate, taxMode, roundingRule),
  )

  // Apply per-line discounts
  const discountedLines = pricedLines.map((line, i) =>
    lines[i].discount ? applyLineDiscount(line, lines[i].discount!, taxMode, roundingRule) : line,
  )

  const subtotalCents = discountedLines.reduce(
    (sum, line) => sum + toMinorUnits(line.subtotal),
    0,
  )

  // Calculate cart discount amount
  let cartDiscountCents = 0
  if (cartDiscount) {
    if (cartDiscount.type === DISCOUNT_TYPE.PERCENTAGE) {
      cartDiscountCents = applyRounding(
        Math.round((subtotalCents * cartDiscount.amount) / 10000),
        roundingRule,
      )
    } else {
      cartDiscountCents = toMinorUnits(cartDiscount.amount)
    }
    cartDiscountCents = Math.min(cartDiscountCents, subtotalCents)
    cartDiscountCents = Math.max(cartDiscountCents, 0)
  }

  // Distribute cart discount across lines by proportional share (largest-remainder method)
  const lineDiscounts: number[] = discountedLines.map(() => 0)

  if (cartDiscountCents > 0 && subtotalCents > 0) {
    let allocated = 0

    // First pass: proportional allocation
    const allocations = discountedLines.map((line) => {
      const proportion =
        (toMinorUnits(line.subtotal) * cartDiscountCents) / subtotalCents
      return proportion
    })

    // Allocate integer parts
    for (let i = 0; i < lineDiscounts.length; i++) {
      lineDiscounts[i] = Math.floor(allocations[i])
      allocated += lineDiscounts[i]
    }

    // Largest-remainder: allocate remaining cents to lines with largest fractional parts
    const remainingCents = cartDiscountCents - allocated
    const fractionalParts = allocations.map((a, i) => ({
      index: i,
      fraction: a - Math.floor(a),
    }))
    fractionalParts.sort((a, b) => b.fraction - a.fraction)

    for (let i = 0; i < remainingCents; i++) {
      lineDiscounts[fractionalParts[i].index]++
    }
  }

  // Recalculate lines with distributed cart discount
  const finalLines = discountedLines.map((line, i) => {
    const totalLineDiscount = line.discount + fromMinorUnits(lineDiscounts[i])
    return applyLineDiscount(
      { ...line, discount: 0 },
      { type: DISCOUNT_TYPE.FIXED_AMOUNT, amount: totalLineDiscount },
      taxMode,
      roundingRule,
    )
  })

  // Aggregate taxes by rate
  const taxByRate: Record<string, number> = {}
  const discountByTaxRate: Record<string, number> = {}

  finalLines.forEach((line) => {
    const rateKey = line.taxRate.toString()
    taxByRate[rateKey] = (taxByRate[rateKey] ?? 0) + toMinorUnits(line.taxAmount)
    discountByTaxRate[rateKey] =
      (discountByTaxRate[rateKey] ?? 0) + toMinorUnits(line.discount)
  })

  const taxCents = Object.values(taxByRate).reduce((sum, val) => sum + val, 0)
  const totalCents = finalLines.reduce((sum, line) => sum + toMinorUnits(line.total), 0)

  return {
    subtotal: fromMinorUnits(subtotalCents),
    discount: fromMinorUnits(cartDiscountCents),
    discountByTaxRate: Object.fromEntries(
      Object.entries(discountByTaxRate).map(([rate, cents]) => [rate, fromMinorUnits(cents)]),
    ),
    taxByRate: Object.fromEntries(
      Object.entries(taxByRate).map(([rate, cents]) => [rate, fromMinorUnits(cents)]),
    ),
    tax: fromMinorUnits(taxCents),
    total: fromMinorUnits(totalCents),
  }
}

// Calculate change due
export function calculateChangeDue(tendered: number, total: number): number {
  const changeCents = toMinorUnits(tendered) - toMinorUnits(total)
  return fromMinorUnits(Math.max(0, changeCents))
}
