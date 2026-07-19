import { SALE_STATUS } from '@domains/sales/entities/sale'
import type { Sale, SaleStatus } from '@domains/sales/entities/sale'
import type { SaleItem } from '@domains/sales/entities/sale-item'
// eslint-disable-next-line boundaries/no-unknown
import type { SalesRepository } from '@domains/sales/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { PaymentsRepository } from '@domains/payments/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'
// eslint-disable-next-line boundaries/no-unknown
import type { CatalogRepository } from '@domains/catalog/repository'
import type { ResolvedSettings } from '@domains/organization/entities/settings'
import { priceCart, type CartLine, type DiscountSpec } from '@domains/sales/lib/money'
import { formatReceiptNumber } from '@domains/sales/lib/receipt-number'
import { resolveTaxRate } from './tax-resolver'
import { DiscountPolicyService } from './discount-policy'
import type { Payment } from '@domains/payments/entities/payment'
import { ValidationError } from '@shared/errors'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import { STOCK_MOVEMENT_TYPE } from '@constants/enums'
import { PaymentService } from '@domains/payments/services/payment-service'
import type { PaymentMethod } from '@constants/enums'

export interface FinalizeSaleInput {
  saleId: string
  shiftId: string
  lines: Array<{
    variantId: string
    quantity: number
    discount?: DiscountSpec
  }>
  cartDiscount?: DiscountSpec
  customerId?: string
  payments: Array<{
    amount: number
    method: string
  }>
  managerOverrideToken?: {
    approvedBy: string
    expiresAt: Date
  }
}

export interface FinalizeSaleResult {
  sale: Sale
  receiptNumber: string
  alreadyFinalized: boolean
}

export class FinalizeSaleService {
  private discountPolicy: DiscountPolicyService

  constructor(
    private clock: Clock,
    private ids: IdGenerator,
  ) {
    this.discountPolicy = new DiscountPolicyService()
  }

  async finalize(
    repos: {
      sales: SalesRepository
      payments: PaymentsRepository
      inventory: InventoryRepository
      catalog: CatalogRepository
    },
    settings: ResolvedSettings,
    input: FinalizeSaleInput,
  ): Promise<FinalizeSaleResult> {
    // Check for idempotency: if sale already exists and is paid, return it
    const existing = await repos.sales.findSaleById(input.saleId)
    if (existing && existing.status === SALE_STATUS.PAID) {
      const receiptNumber = existing.receiptNumber
        ? formatReceiptNumber('UNKNOWN', existing.receiptNumber)
        : 'UNKNOWN'
      return {
        sale: existing,
        receiptNumber,
        alreadyFinalized: true,
      }
    }

    // Resolve variant prices and tax rates
    const variantDetails = await Promise.all(
      input.lines.map(async (line) => {
        const variant = await repos.catalog.findVariantById(line.variantId)
        if (!variant) {
          throw new ValidationError(`Variant ${line.variantId} not found`)
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

    // Validate discounts
    const cartLines: CartLine[] = variantDetails.map((detail) => ({
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      taxRate: detail.taxRate,
      discount: detail.discount,
    }))

    // Price the cart
    const cartTotal = priceCart(cartLines, input.cartDiscount, settings.taxMode)

    // Validate per-line discounts
    for (const detail of variantDetails) {
      if (detail.discount) {
        this.discountPolicy.validateDiscount(
          {
            type: detail.discount.type,
            amount: detail.discount.amount,
            lineOrCartSubtotal: detail.quantity * detail.unitPrice,
          },
          settings.discountLimits,
          input.managerOverrideToken,
        )
      }
    }

    // Validate cart discount
    if (input.cartDiscount) {
      this.discountPolicy.validateDiscount(
        {
          type: input.cartDiscount.type,
          amount: input.cartDiscount.amount,
          lineOrCartSubtotal: cartTotal.subtotal,
        },
        settings.discountLimits,
        input.managerOverrideToken,
      )
    }

    // Get or increment receipt counter
    let receiptCounter = await repos.sales.findReceiptCounter(settings.currency)
    if (!receiptCounter) {
      receiptCounter = {
        id: this.ids.next(),
        orgId: 'unknown', // Will be set by caller
        branchId: 'unknown', // Will be set by caller
        nextNumber: 1,
        updatedAt: this.clock.now(),
      }
    }

    const receiptNumber = receiptCounter.nextNumber
    receiptCounter.nextNumber += 1
    receiptCounter.updatedAt = this.clock.now()
    await repos.sales.saveReceiptCounter(receiptCounter)

    // Create sale
    const now = this.clock.now()
    const sale: Sale = {
      id: input.saleId,
      orgId: 'unknown', // Caller should provide
      branchId: 'unknown', // Caller should provide
      shiftId: input.shiftId,
      status: SALE_STATUS.PAID,
      receiptNumber,
      customerId: input.customerId,
      subtotal: cartTotal.subtotal,
      discount: cartTotal.discount,
      tax: cartTotal.tax,
      total: cartTotal.total,
      createdAt: now,
      createdBy: 'unknown', // Caller should provide
    }
    await repos.sales.saveSale(sale)

    // Create sale items
    for (let i = 0; i < variantDetails.length; i++) {
      const detail = variantDetails[i]
      const cartLine = cartLines[i]

      // Re-price this line to get exact amounts
      const linePricing = priceCart([cartLine], undefined, settings.taxMode)
      const lineDiscount = detail.discount
        ? (detail.discount.type === 'percentage'
            ? (linePricing.subtotal * detail.discount.amount) / 100
            : detail.discount.amount)
        : 0

      const item: SaleItem = {
        id: this.ids.next(),
        saleId: input.saleId,
        variantId: detail.variantId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        discount: Math.min(lineDiscount, linePricing.subtotal),
        taxRate: detail.taxRate,
        taxAmount: linePricing.tax,
        subtotal: linePricing.subtotal - Math.min(lineDiscount, linePricing.subtotal),
        total: linePricing.total - Math.min(lineDiscount, linePricing.subtotal),
        name: detail.name,
        sku: detail.sku,
        createdAt: now,
      }
      await repos.sales.saveSaleItem(item)

      // Record stock movement (decrement)
      await repos.inventory.recordSale(repos.inventory, {
        orgId: sale.orgId,
        branchId: sale.branchId,
        variantId: detail.variantId,
        quantity: detail.quantity,
        reference: input.saleId,
        createdBy: sale.createdBy,
        allowOversell: false,
      })
    }

    // Create payments
    for (const paymentInput of input.payments) {
      const payment: Payment = {
        id: this.ids.next(),
        saleId: input.saleId,
        amount: paymentInput.amount,
        currency: settings.currency,
        method: paymentInput.method,
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      }
      await repos.payments.savePayment(payment)
    }

    return {
      sale,
      receiptNumber: formatReceiptNumber('UNKNOWN', receiptNumber),
      alreadyFinalized: false,
    }
  }
}
