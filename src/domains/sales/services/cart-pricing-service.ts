import { DISCOUNT_TYPE } from '@constants/enums/discount-type'
import { TAX_MODE } from '@constants/enums/tax-mode'
import type { Variant } from '@domains/catalog/entities/variant'
import type { ResolvedSettings } from '@domains/organization/entities/settings'
import { priceCart, type CartLine } from '@domains/sales/lib/money'
import { resolveTaxRate } from './tax-resolver'
// eslint-disable-next-line boundaries/no-unknown
import type { CatalogRepository } from '@domains/catalog/repository'
import type { DiscountSpec } from '@domains/sales/lib/money'

export interface CartLineInput {
  variantId: string
  quantity: number
  discount?: DiscountSpec
}

export interface CartInput {
  lines: CartLineInput[]
  cartDiscount?: DiscountSpec
}

export interface PricedCart {
  lines: PricedCartLine[]
  subtotal: number
  discount: number
  tax: number
  total: number
  taxByRate: Record<string, number>
}

export interface PricedCartLine {
  variantId: string
  quantity: number
  unitPrice: number
  name: string
  sku: string
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
}

export class CartPricingService {
  async priceCart(
    repos: { catalog: CatalogRepository },
    settings: ResolvedSettings,
    input: CartInput,
  ): Promise<PricedCart> {
    // Resolve variant prices and tax rates
    const variantDetails = await Promise.all(
      input.lines.map(async (line) => {
        const variant = await repos.catalog.findVariantById(line.variantId)
        if (!variant) {
          throw new Error(`Variant ${line.variantId} not found`)
        }

        const category = variant.categoryId
          ? await repos.catalog.findCategoryById(variant.categoryId)
          : null

        const taxRate = resolveTaxRate(settings, category)

        return {
          variantId: line.variantId,
          quantity: line.quantity,
          unitPrice: variant.sellingPrice ?? 0,
          name: variant.name,
          sku: variant.sku,
          taxRate,
          discount: line.discount,
        }
      }),
    )

    // Build CartLine objects for money.ts
    const cartLines: CartLine[] = variantDetails.map((detail) => ({
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      taxRate: detail.taxRate,
      discount: detail.discount,
    }))

    // Calculate totals using money.ts
    const totals = priceCart(cartLines, input.cartDiscount, settings.taxMode)

    // Build response with variant details
    const pricedLines: PricedCartLine[] = variantDetails.map((detail, index) => {
      const cartLine = cartLines[index]
      const pricedLine = priceCart(
        [{ quantity: detail.quantity, unitPrice: detail.unitPrice, taxRate: detail.taxRate }],
        undefined,
        settings.taxMode,
      )

      // Apply per-line discount if present
      let lineTotal = pricedLine.total
      let lineDiscount = 0
      let lineTax = pricedLine.tax

      if (detail.discount) {
        const discountAmount =
          detail.discount.type === DISCOUNT_TYPE.PERCENTAGE
            ? (pricedLine.subtotal * detail.discount.amount) / 100
            : detail.discount.amount

        lineDiscount = Math.min(discountAmount, pricedLine.subtotal)
        const discountedSubtotal = pricedLine.subtotal - lineDiscount

        if (settings.taxMode === TAX_MODE.EXCLUSIVE) {
          lineTax = (discountedSubtotal * detail.taxRate) / 100
          lineTotal = discountedSubtotal + lineTax
        } else {
          lineTax = discountedSubtotal - discountedSubtotal / (1 + detail.taxRate / 100)
          lineTotal = discountedSubtotal
        }
      }

      return {
        variantId: detail.variantId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        name: detail.name,
        sku: detail.sku,
        subtotal: pricedLine.subtotal - lineDiscount,
        discount: lineDiscount,
        taxRate: detail.taxRate,
        taxAmount: lineTax,
        total: lineTotal,
      }
    })

    return {
      lines: pricedLines,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      taxByRate: totals.taxByRate,
    }
  }
}
