import { PAYMENT_METHOD, type PaymentMethod } from '@constants/enums/payment-method'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHOD.CASH]: 'Cash',
  [PAYMENT_METHOD.CARD]: 'Card',
  [PAYMENT_METHOD.CHECK]: 'Check',
  [PAYMENT_METHOD.STORE_CREDIT]: 'Store Credit',
  [PAYMENT_METHOD.OTHER]: 'Other',
}
