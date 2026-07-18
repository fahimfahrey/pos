'use client'

import { useActionState } from 'react'
import { createEnumValueAction } from '@domains/system-enums/actions/enum-values'
import { ENUM_REGISTRY_KEY } from '@constants/enums'
import {
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

const EDITABLE_KEYS = [
  ENUM_REGISTRY_KEY.PAYMENT_METHOD,
  ENUM_REGISTRY_KEY.DISCOUNT_TYPE,
  ENUM_REGISTRY_KEY.UNIT_OF_MEASURE,
  ENUM_REGISTRY_KEY.STOCK_MOVEMENT_TYPE,
  ENUM_REGISTRY_KEY.SHIFT_STATUS,
]

export function CreateEnumValueForm({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(createEnumValueAction, {})

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orgId" value={orgId} />

      <div>
        <label htmlFor="registryKey" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="registryKey"
          name="registryKey"
          required
          disabled={pending}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Select a category...</option>
          {EDITABLE_KEYS.map((key) => (
            <option key={key} value={key}>
              {REGISTRY_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
          Value <span className="text-xs text-gray-500">(lowercase, no spaces)</span>
        </label>
        <input
          id="value"
          type="text"
          name="value"
          placeholder="e.g., bkash"
          required
          pattern="[a-z0-9_]+"
          disabled={pending}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
          Display Label
        </label>
        <input
          id="label"
          type="text"
          name="label"
          placeholder="e.g., bKash"
          required
          disabled={pending}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {state.error && (
        <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {pending ? 'Adding...' : 'Add Value'}
      </button>
    </form>
  )
}
