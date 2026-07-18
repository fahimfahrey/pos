import { DISCOUNT_TYPE, type DiscountType } from '@constants/enums/discount-type'

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  [DISCOUNT_TYPE.PERCENTAGE]: 'Percentage',
  [DISCOUNT_TYPE.FIXED_AMOUNT]: 'Fixed Amount',
}
