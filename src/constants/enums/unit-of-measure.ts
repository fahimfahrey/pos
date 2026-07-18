export const UNIT_OF_MEASURE = {
  EACH: 'unit',
  KG: 'kg',
  G: 'g',
  L: 'l',
  ML: 'ml',
  BOX: 'box',
  PACK: 'pack',
} as const

export type UnitOfMeasure = (typeof UNIT_OF_MEASURE)[keyof typeof UNIT_OF_MEASURE]
