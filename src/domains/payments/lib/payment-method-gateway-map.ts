import type { PaymentMethod } from '@constants/enums'

export function resolveGatewayForMethod(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    cash: 'cash',
    card: 'card',
    store_credit: 'store-credit',
    check: 'manual',
    other: 'manual',
  }
  return map[method]
}
