// eslint-disable-next-line boundaries/no-unknown
import type { SystemEnumValueRepository } from '@domains/system-enums/repository'
import type { SystemEnumValue } from '@domains/system-enums/entities/system-enum-value'
import type { EnumRegistryKey } from '@constants/enums'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreSystemEnumValueRepository implements SystemEnumValueRepository {
  private collection: Collection<SystemEnumValue>

  constructor(tx: DriverTransaction) {
    this.collection = new Collection<SystemEnumValue>(tx, 'systemEnumValues')
  }

  async save(value: SystemEnumValue): Promise<void> {
    await this.collection.put(value)
  }

  async findById(id: string): Promise<SystemEnumValue | null> {
    return (await this.collection.get(id)) ?? null
  }

  async listForOrg(orgId: string): Promise<SystemEnumValue[]> {
    return this.collection.filter((v) => v.orgId === orgId)
  }

  async listForOrgAndKey(orgId: string, registryKey: EnumRegistryKey): Promise<SystemEnumValue[]> {
    return this.collection.filter((v) => v.orgId === orgId && v.registryKey === registryKey)
  }

  async delete(id: string): Promise<void> {
    await this.collection.delete(id)
  }
}
