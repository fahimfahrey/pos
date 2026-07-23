import type { PricedLine } from '@domains/sales/lib/money'

export interface PricedCart {
  lines: PricedLine[]
  subtotal: number
  discount: number
  tax: number
  total: number
  taxByRate: Record<string, number>
}
