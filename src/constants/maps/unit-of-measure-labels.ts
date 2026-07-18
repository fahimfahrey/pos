import { UNIT_OF_MEASURE, type UnitOfMeasure } from '@constants/enums/unit-of-measure'

export const UNIT_OF_MEASURE_LABELS: Record<UnitOfMeasure, string> = {
  [UNIT_OF_MEASURE.EACH]: 'Each',
  [UNIT_OF_MEASURE.KG]: 'Kilogram',
  [UNIT_OF_MEASURE.G]: 'Gram',
  [UNIT_OF_MEASURE.L]: 'Liter',
  [UNIT_OF_MEASURE.ML]: 'Milliliter',
  [UNIT_OF_MEASURE.BOX]: 'Box',
  [UNIT_OF_MEASURE.PACK]: 'Pack',
}
