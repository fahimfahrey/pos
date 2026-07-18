import type { EnumRegistryKey } from '@constants/enums'

export interface SystemEnumValue {
  id: string
  orgId: string
  registryKey: EnumRegistryKey
  value: string
  label: string
  active: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
