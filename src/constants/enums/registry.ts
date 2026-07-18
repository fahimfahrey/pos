import { ORDER_STATUS } from './order-status'
import { PAYMENT_METHOD } from './payment-method'
import { DISCOUNT_TYPE } from './discount-type'
import { UNIT_OF_MEASURE } from './unit-of-measure'
import { STOCK_MOVEMENT_TYPE } from './stock-movement-type'
import { SHIFT_STATUS } from './shift-status'
import { MEMBERSHIP_ROLE } from './membership-role'

export const ENUM_REGISTRY_KEY = {
  SALE_STATUS: 'saleStatus',
  PAYMENT_METHOD: 'paymentMethod',
  DISCOUNT_TYPE: 'discountType',
  UNIT_OF_MEASURE: 'unitOfMeasure',
  STOCK_MOVEMENT_TYPE: 'stockMovementType',
  SHIFT_STATUS: 'shiftStatus',
  MEMBERSHIP_ROLE: 'membershipRole',
} as const

export type EnumRegistryKey = (typeof ENUM_REGISTRY_KEY)[keyof typeof ENUM_REGISTRY_KEY]

export const STATIC_ENUM_VALUES: Record<EnumRegistryKey, readonly string[]> = {
  [ENUM_REGISTRY_KEY.SALE_STATUS]: Object.values(ORDER_STATUS),
  [ENUM_REGISTRY_KEY.PAYMENT_METHOD]: Object.values(PAYMENT_METHOD),
  [ENUM_REGISTRY_KEY.DISCOUNT_TYPE]: Object.values(DISCOUNT_TYPE),
  [ENUM_REGISTRY_KEY.UNIT_OF_MEASURE]: Object.values(UNIT_OF_MEASURE),
  [ENUM_REGISTRY_KEY.STOCK_MOVEMENT_TYPE]: Object.values(STOCK_MOVEMENT_TYPE),
  [ENUM_REGISTRY_KEY.SHIFT_STATUS]: Object.values(SHIFT_STATUS),
  [ENUM_REGISTRY_KEY.MEMBERSHIP_ROLE]: Object.values(MEMBERSHIP_ROLE).map(String),
}
