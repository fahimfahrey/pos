import { deactivateEnumValueAction, listEnumValues } from '@domains/system-enums/actions/enum-values'
import type { SystemEnumValue } from '@domains/system-enums/entities/system-enum-value'
import { ENUM_REGISTRY_KEY, STATIC_ENUM_VALUES } from '@constants/enums'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  DISCOUNT_TYPE_LABELS,
  UNIT_OF_MEASURE_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
  SHIFT_STATUS_LABELS,
  MEMBERSHIP_ROLE_LABELS,
} from '@constants/maps'

const REGISTRY_LABELS: Record<string, string> = {
  [ENUM_REGISTRY_KEY.SALE_STATUS]: 'Sale Status',
  [ENUM_REGISTRY_KEY.PAYMENT_METHOD]: 'Payment Method',
  [ENUM_REGISTRY_KEY.DISCOUNT_TYPE]: 'Discount Type',
  [ENUM_REGISTRY_KEY.UNIT_OF_MEASURE]: 'Unit of Measure',
  [ENUM_REGISTRY_KEY.STOCK_MOVEMENT_TYPE]: 'Stock Movement Type',
  [ENUM_REGISTRY_KEY.SHIFT_STATUS]: 'Shift Status',
  [ENUM_REGISTRY_KEY.MEMBERSHIP_ROLE]: 'Membership Role',
}

const LABEL_MAPS: Record<string, Record<string, string>> = {
  [ENUM_REGISTRY_KEY.SALE_STATUS]: ORDER_STATUS_LABELS,
  [ENUM_REGISTRY_KEY.PAYMENT_METHOD]: PAYMENT_METHOD_LABELS,
  [ENUM_REGISTRY_KEY.DISCOUNT_TYPE]: DISCOUNT_TYPE_LABELS,
  [ENUM_REGISTRY_KEY.UNIT_OF_MEASURE]: UNIT_OF_MEASURE_LABELS,
  [ENUM_REGISTRY_KEY.STOCK_MOVEMENT_TYPE]: STOCK_MOVEMENT_TYPE_LABELS,
  [ENUM_REGISTRY_KEY.SHIFT_STATUS]: SHIFT_STATUS_LABELS,
  [ENUM_REGISTRY_KEY.MEMBERSHIP_ROLE]: MEMBERSHIP_ROLE_LABELS,
}

export async function EnumValuesTable({
  orgId,
  values,
}: {
  orgId: string
  values: SystemEnumValue[]
}) {
  const categories = Object.values(ENUM_REGISTRY_KEY)

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{REGISTRY_LABELS[category]}</h3>

          <div className="space-y-2">
            {/* Static values */}
            {STATIC_ENUM_VALUES[category].map((value) => (
              <div key={`static-${value}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded">
                    {LABEL_MAPS[category]?.[value] || value}
                  </span>
                  <span className="sr-only">(built-in)</span>
                </div>
                <span className="text-xs text-gray-600">Built-in</span>
              </div>
            ))}

            {/* Runtime values */}
            {values
              .filter((v) => v.registryKey === category && v.active)
              .map((value) => (
                <form key={value.id} action={deactivateEnumValueAction} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <input type="hidden" name="enumValueId" value={value.id} />
                  <input type="hidden" name="orgId" value={orgId} />

                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-200 text-blue-800 rounded">
                      {value.label}
                    </span>
                    <span className="sr-only">(custom)</span>
                  </div>

                  <button
                    type="submit"
                    aria-label={`Deactivate ${value.label}`}
                    className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                  >
                    Deactivate
                  </button>
                </form>
              ))}

            {/* Empty state */}
            {STATIC_ENUM_VALUES[category].length === 0 &&
              values.filter((v) => v.registryKey === category && v.active).length === 0 && (
                <p className="text-sm text-gray-500 italic">No values defined</p>
              )}
          </div>
        </div>
      ))}
    </div>
  )
}
