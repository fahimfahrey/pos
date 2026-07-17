export const TAX_MODE = {
  INCLUSIVE: 'inclusive',
  EXCLUSIVE: 'exclusive',
} as const

export type TaxMode = (typeof TAX_MODE)[keyof typeof TAX_MODE]
