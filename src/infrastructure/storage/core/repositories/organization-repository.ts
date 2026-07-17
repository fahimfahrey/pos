// eslint-disable-next-line boundaries/no-unknown
import type { OrganizationRepository } from '@domains/organization/repository'
 
import type { Store, Register, OrganizationSetting } from '@domains/organization/entities/store'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreOrganizationRepository implements OrganizationRepository {
  private storeCollection: Collection<Store>
  private registerCollection: Collection<Register>
  private settingCollection: Collection<OrganizationSetting>

  constructor(tx: DriverTransaction) {
    this.storeCollection = new Collection<Store>(tx, 'stores')
    this.registerCollection = new Collection<Register>(tx, 'registers')
    this.settingCollection = new Collection<OrganizationSetting>(tx, 'organizationSettings')
  }

  async saveStore(store: Store): Promise<void> {
    await this.storeCollection.put(store)
  }

  async findStoreById(id: string): Promise<Store | null> {
    return (await this.storeCollection.get(id)) ?? null
  }

  async listStores(): Promise<Store[]> {
    return this.storeCollection.getAll()
  }

  async saveRegister(register: Register): Promise<void> {
    await this.registerCollection.put(register)
  }

  async listRegistersForStore(storeId: string): Promise<Register[]> {
    return this.registerCollection.filter((r) => r.storeId === storeId)
  }

  async getSetting(key: string): Promise<OrganizationSetting | null> {
    return this.settingCollection.find((s) => s.key === key)
  }

  async putSetting(setting: OrganizationSetting): Promise<void> {
    await this.settingCollection.put(setting)
  }
}
