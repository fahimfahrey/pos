import type { Store, Register, OrganizationSetting } from '@domains/organization/entities/store'

export interface OrganizationRepository {
  saveStore(store: Store): Promise<void>
  findStoreById(id: string): Promise<Store | null>
  listStores(): Promise<Store[]>
  saveRegister(register: Register): Promise<void>
  listRegistersForStore(storeId: string): Promise<Register[]>
  getSetting(key: string): Promise<OrganizationSetting | null>
  putSetting(setting: OrganizationSetting): Promise<void>
}
