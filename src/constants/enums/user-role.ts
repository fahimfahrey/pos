export const USER_ROLE = {
  CASHIER: 'cashier',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]
