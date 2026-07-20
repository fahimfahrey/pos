export const AUDIT_ACTION = {
  PRICE_CHANGE: 'price_change',
  DISCOUNT_OVERRIDE: 'discount_override',
  REFUND: 'refund',
  VOID: 'void',
  STOCK_ADJUSTMENT: 'stock_adjustment',
  SHIFT_CLOSE_DISCREPANCY: 'shift_close_discrepancy',
  ROLE_CHANGE: 'role_change',
  SETTINGS_CHANGE: 'settings_change',
  ENUM_CHANGE: 'enum_change',
} as const

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION]
