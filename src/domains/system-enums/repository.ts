import type { SystemEnumValue } from './entities/system-enum-value'
import type { EnumRegistryKey } from '@constants/enums'

export interface SystemEnumValueRepository {
  save(value: SystemEnumValue): Promise<void>
  findById(id: string): Promise<SystemEnumValue | null>
  listForOrg(orgId: string): Promise<SystemEnumValue[]>
  listForOrgAndKey(orgId: string, registryKey: EnumRegistryKey): Promise<SystemEnumValue[]>
  delete(id: string): Promise<void>
}
